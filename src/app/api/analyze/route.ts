import { NextResponse } from "next/server";
import type { AnalysisResult, AnalyzeRequest } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.HACKCLUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing HACKCLUB_API_KEY in environment." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://ai.hackclub.com/proxy/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a coding teacher. Analyze the code the user provides and return ONLY a valid JSON object with no markdown, no backticks, no extra text whatsoever.",
            },
            {
              role: "user",
              content: `Analyze this code and return JSON in exactly this shape: { "explanation": "3-5 sentence plain english explanation", "questions": [ { "id": "1", "question": "question text", "options": ["A) option", "B) option", "C) option", "D) option"], "correctAnswer": 0 } ], "challenge": { "title": "short challenge title", "prompt": "harder coding problem based on the original snippet", "constraints": ["constraint 1", "constraint 2"], "starterCode": "function solve(input) {\\n  // write your solution\\n}" } } — generate 3 quiz questions and one harder challenge problem. Here is the code: ${code}`,
            },
          ],
        }),
      }
    );

    const rawResponseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `AI request failed: ${response.status} ${rawResponseText}` },
        { status: 500 }
      );
    }

    let raw: { choices?: Array<{ message?: { content?: string } }> };
    try {
      raw = JSON.parse(rawResponseText) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
    } catch (parseError) {
      const parseMessage =
        parseError instanceof Error ? parseError.message : String(parseError);
      console.error("[/api/analyze] Failed to parse upstream JSON:", parseError);
      return NextResponse.json(
        { error: `Failed to parse upstream AI JSON response: ${parseMessage}` },
        { status: 500 }
      );
    }

    const content = raw.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI response did not include message content." },
        { status: 500 }
      );
    }

    try {
      const cleanedContent = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsed = JSON.parse(cleanedContent) as AnalysisResult;
      const normalized: AnalysisResult = {
        explanation: parsed.explanation,
        questions: (parsed.questions ?? []).map((question, index) => ({
          ...question,
          id:
            typeof question.id === "string"
              ? Number.parseInt(question.id, 10) || index + 1
              : question.id ?? index + 1,
          correctAnswer:
            typeof question.correctAnswer === "string"
              ? Number.parseInt(question.correctAnswer, 10) || 0
              : question.correctAnswer ?? 0,
        })),
        challenge: {
          title: parsed.challenge?.title ?? "Harder Practice Challenge",
          prompt:
            parsed.challenge?.prompt ??
            "Write a harder, production-ready version of the original logic with clear edge-case handling.",
          constraints:
            parsed.challenge?.constraints?.filter(
              (constraint) => typeof constraint === "string" && constraint.trim()
            ) ?? [],
          starterCode:
            parsed.challenge?.starterCode ??
            "function solve(input) {\n  // write your solution\n}",
        },
      };

      return NextResponse.json(normalized);
    } catch (parseError) {
      const parseMessage =
        parseError instanceof Error ? parseError.message : String(parseError);
      console.error(
        "[/api/analyze] Failed to parse model content JSON:",
        parseError
      );
      return NextResponse.json(
        {
          error:
            `Failed to parse AI response content as JSON. Ensure the model returns raw JSON only. ${parseMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error.";
    console.error("[/api/analyze] Unhandled error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
