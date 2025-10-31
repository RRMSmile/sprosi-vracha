'use client'

import { useState } from 'react'

export default function SymptomBackPain() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const next = (answer: string) => {
    setAnswers([...answers, answer])
    setStep(step + 1)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-800">
      {/* Заголовок */}
      <h1 className="text-3xl font-bold mb-6">Боль в спине: причины, диагностика и лечение</h1>
      <p className="text-lg mb-8 text-gray-600">
        Разбираемся, почему возникает боль в спине, когда стоит обратиться к врачу и какие методы диагностики помогают найти точную причину.
      </p>

      {/* Инфографика */}
      <section className="bg-white shadow rounded-2xl p-4 mb-10">
        <h2 className="text-xl font-semibold mb-4">Основные зоны боли</h2>
        <img
          src="/images/symptoms/back-pain-zones.svg"
          alt="Зоны боли в спине"
          className="rounded-xl w-full max-h-[400px] object-contain"
        />
        <p className="mt-2 text-sm text-gray-500">
          Инфографика показывает, где чаще всего локализуется боль и какие причины ей соответствуют.
        </p>
      </section>

      {/* Мини-опрос */}
      <section className="bg-blue-50 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Проверим симптомы</h2>
        {step === 0 && (
          <>
            <p className="mb-4">Боль появилась после физической нагрузки?</p>
            <div className="flex gap-4">
              <button onClick={() => next('after_load')} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Да</button>
              <button onClick={() => next('no_load')} className="px-4 py-2 bg-gray-200 rounded-xl">Нет</button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="mb-4">Есть ли онемение или покалывание в ногах?</p>
            <div className="flex gap-4">
              <button onClick={() => next('numbness_yes')} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Да</button>
              <button onClick={() => next('numbness_no')} className="px-4 py-2 bg-gray-200 rounded-xl">Нет</button>
            </div>
          </>
        )}
        {step > 1 && (
          <div className="mt-4">
            <p className="font-medium mb-3">Рекомендация:</p>
            {answers.includes('numbness_yes') ? (
              <p>Вероятна межпозвоночная грыжа или ущемление нерва — рекомендуем обратиться к неврологу.</p>
            ) : (
              <p>Скорее всего, мышечное перенапряжение. При повторении боли запишитесь к терапевту.</p>
            )}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Частые вопросы</h2>
        <details className="mb-2 bg-white shadow rounded-lg p-4">
          <summary className="cursor-pointer font-medium">Когда нужно срочно идти к врачу?</summary>
          <p className="mt-2 text-gray-600">Если боль усиливается, есть слабость или потеря чувствительности — не откладывайте визит к врачу.</p>
        </details>
        <details className="mb-2 bg-white shadow rounded-lg p-4">
          <summary className="cursor-pointer font-medium">Помогает ли массаж?</summary>
          <p className="mt-2 text-gray-600">Лёгкий массаж облегчает мышечное напряжение, но при воспалении или травме противопоказан.</p>
        </details>
      </section>

      {/* CTA */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl p-8 shadow">
        <h3 className="text-2xl font-semibold mb-3">Получите онлайн-консультацию</h3>
        <p className="mb-6 text-blue-50">Опишите свои симптомы и врач подскажет, к какому специалисту обратиться.</p>
        <a
          href="/consultations/nevrolog-online"
          className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 transition"
        >
          Спросить врача
        </a>
      </section>
    </main>
  )
}

