'use client'

import { useState } from 'react'

export default function SymptomCheckerPage() {
  const [symptom, setSymptom] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkSymptom = async () => {
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      if (!symptom) {
        setResult('Пожалуйста, введите симптом для проверки.')
      } else if (/кашл/i.test(symptom)) {
        setResult('Возможные причины: простуда, бронхит, ОРВИ. Рекомендуется консультация терапевта.')
      } else if (/боль в спине/i.test(symptom)) {
        setResult('Возможные причины: остеохондроз, перенапряжение, воспаление нерва. Обратитесь к неврологу.')
      } else if (/температура/i.test(symptom)) {
        setResult('Возможные причины: вирусная инфекция, воспалительный процесс. Следует измерить температуру и обратиться к врачу.')
      } else {
        setResult('Симптом требует уточнения. Рекомендуем онлайн-консультацию специалиста.')
      }
      setLoading(false)
    }, 1200)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Онлайн-проверка симптомов</h1>
      <p className="text-lg mb-8 text-gray-600">
        Введите один или несколько симптомов — система подскажет возможные причины и к какому врачу обратиться.
      </p>

      <section className="bg-white shadow rounded-2xl p-6 mb-10">
        <label className="block text-lg font-medium mb-2">Ваш симптом:</label>
        <input
          type="text"
          placeholder="например: кашель, боль в спине, температура..."
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={checkSymptom}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? 'Проверяем...' : 'Проверить'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-gray-800">
            <h3 className="font-semibold mb-1">Результат:</h3>
            <p>{result}</p>
          </div>
        )}
      </section>

      <section className="mb-10 bg-gray-50 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-3">Как это работает?</h2>
        <img
          src="/images/diagnostics/symptom-checker.svg"
          alt="Схема проверки симптомов"
          className="rounded-xl w-full max-h-[400px] object-contain mb-3"
        />
        <p className="text-gray-600">
          Интерактивная проверка помогает быстро оценить характер симптомов и понять, к какому врачу обратиться.
        </p>
      </section>

      <section className="text-center bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl p-8 shadow">
        <h3 className="text-2xl font-semibold mb-3">Нужна точная консультация?</h3>
        <p className="mb-6 text-blue-50">Опишите симптомы врачу онлайн и получите персональную рекомендацию.</p>
        <a
          href="/consultations/terapevt-online"
          className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 transition"
        >
          Спросить терапевта
        </a>
      </section>
    </main>
  )
}
