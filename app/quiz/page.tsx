"use client";

import { useEffect, useState } from "react";
import { WORDS } from "./words";

const ROUND = 10;
const NEXT_DELAY_MS = 1500;

type Question = { kanji: string; answer: string; choices: string[] };

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeRound = (): Question[] =>
  shuffle(WORDS)
    .slice(0, ROUND)
    .map((w) => ({ kanji: w.kanji, answer: w.yomi, choices: shuffle([w.yomi, w.wrong]) }));

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // 出題順のランダム化はクライアント側のみで行う（hydration不一致を避ける）
  useEffect(() => setQuestions(makeRound()), []);

  useEffect(() => {
    if (picked === null) return;
    const id = setTimeout(() => {
      setIndex((i) => i + 1);
      setPicked(null);
    }, NEXT_DELAY_MS);
    return () => clearTimeout(id);
  }, [picked]);

  const restart = () => {
    setQuestions(makeRound());
    setIndex(0);
    setScore(0);
    setPicked(null);
  };

  if (questions.length === 0) return <main className="wrap" />;

  if (index >= questions.length) {
    return (
      <main className="wrap">
        <h1 className="title">結果</h1>
        <p className="sub">漢検2級レベル 読みクイズ</p>
        <div className="qcard result">
          <div className="score">
            {score}<span> / {questions.length}</span>
          </div>
          <button className="qbtn restart" onClick={restart}>
            もう一度
          </button>
        </div>
      </main>
    );
  }

  const q = questions[index];
  const answered = picked !== null;

  return (
    <main className="wrap">
      <h1 className="title">漢字の読みクイズ</h1>
      <p className="sub">
        第 {index + 1} 問 / {questions.length}　正解 {score}
      </p>

      <div className="qcard">
        <div className="kanji">{q.kanji}</div>
        <div className="choices">
          {q.choices.map((c) => {
            const state = !answered ? "" : c === q.answer ? "correct" : c === picked ? "wrong" : "dim";
            return (
              <button
                key={c}
                className={`qbtn ${state}`}
                disabled={answered}
                onClick={() => {
                  setPicked(c);
                  if (c === q.answer) setScore((s) => s + 1);
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <p className={`verdict ${answered ? "show" : ""} ${picked === q.answer ? "ok" : "ng"}`} aria-live="polite">
          {answered ? (picked === q.answer ? "◯ 正解！" : `✕ 不正解… 正しくは「${q.answer}」`) : " "}
        </p>
      </div>
    </main>
  );
}
