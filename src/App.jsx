import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  // 소비내역
  const [expenses, setExpenses] = useState([])

  // 소비 입력
  const [category, setCategory] = useState('음식')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(
  new Date().toISOString().split('T')[0]
)

  // 추천 반응 저장
  const [feedback, setFeedback] = useState({})

  // 선택한 추천
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)

  // -------------------------
  // 소비내역 추가
  // -------------------------
  const addExpense = () => {
    if (item.trim() === '' || amount === '') {
      alert('상품명과 금액을 입력해주세요.')
      return
    }

    const newExpense = {
      id: Date.now(),
      category,
      item: item.trim(),
      amount: Number(amount),
      date: purchaseDate,
    }

    setExpenses((prev) => [...prev, newExpense])

    setItem('')
    setAmount('')
    setPurchaseDate(new Date().toISOString().split('T')[0])
  }
// -------------------------
// 필요 시점 예측
// -------------------------
const getNeedPredictions = () => {
  const itemGroups = {}

  expenses.forEach((expense) => {
    if (!itemGroups[expense.item]) {
      itemGroups[expense.item] = []
    }

    itemGroups[expense.item].push(expense)
  })

  const predictions = []

  Object.entries(itemGroups).forEach(([itemName, records]) => {
    if (records.length < 2) {
      return
    }

    const dates = records
      .map((record) => new Date(record.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b)

    if (dates.length < 2) {
      return
    }

    const intervals = []

    for (let i = 1; i < dates.length; i += 1) {
      const diff = Math.round(
        (dates[i] - dates[i - 1]) /
          (1000 * 60 * 60 * 24)
      )

      if (diff > 0) {
        intervals.push(diff)
      }
    }

    if (intervals.length === 0) {
      return
    }

    const averageInterval = Math.round(
      intervals.reduce((sum, value) => sum + value, 0) /
        intervals.length
    )

    const lastDate = dates[dates.length - 1]

    const predictedDate = new Date(lastDate)

    predictedDate.setDate(
      predictedDate.getDate() + averageInterval
    )

    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const daysUntil = Math.ceil(
      (predictedDate - today) /
        (1000 * 60 * 60 * 24)
    )

    predictions.push({
      item: itemName,
      category: records[0].category,
      purchaseCount: records.length,
      averageInterval,
      predictedDate,
      daysUntil,
    })
  })

  return predictions.sort(
    (a, b) => a.daysUntil - b.daysUntil
  )
}

const formatPredictionDate = (date) => {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}
  // -------------------------
  // 소비 분석
  // -------------------------
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const categoryTotal = expenses.reduce((result, expense) => {
    if (!result[expense.category]) {
      result[expense.category] = 0
    }

    result[expense.category] += expense.amount
    return result
  }, {})

  const favoriteCategory =
    Object.keys(categoryTotal).length > 0
      ? Object.entries(categoryTotal).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
      : '아직 없음'

  // -------------------------
  // 소비 품목 → 취향 분석
  // -------------------------
  const analyzePreferences = () => {
    const preferences = []

    const allItems = expenses
      .map((expense) => expense.item)
      .join(' ')

    if (
      allItems.includes('마라') ||
      allItems.includes('훠궈') ||
      allItems.includes('탄탄면')
    ) {
      preferences.push({
        title: '매콤한 중식',
        keyword: '마라·중식',
        description:
          '매콤하고 자극적인 중식 메뉴를 선호하는 경향이 있어요.',
      })
    }

    if (
      allItems.includes('초밥') ||
      allItems.includes('회') ||
      allItems.includes('사시미') ||
      allItems.includes('우동')
    ) {
      preferences.push({
        title: '일식',
        keyword: '초밥·회',
        description:
          '신선한 해산물과 일식 메뉴를 자주 선택하고 있어요.',
      })
    }

    if (
      allItems.includes('치킨') ||
      allItems.includes('피자') ||
      allItems.includes('햄버거')
    ) {
      preferences.push({
        title: '캐주얼 외식',
        keyword: '치킨·피자·버거',
        description:
          '간편하게 즐길 수 있는 외식 메뉴를 선호해요.',
      })
    }

    if (
      allItems.includes('아메리카노') ||
      allItems.includes('커피') ||
      allItems.includes('라떼')
    ) {
      preferences.push({
        title: '커피',
        keyword: '커피',
        description:
          '카페와 커피 관련 소비가 자주 나타나요.',
      })
    }

    if (
      allItems.includes('케이크') ||
      allItems.includes('디저트') ||
      allItems.includes('베이커리')
    ) {
      preferences.push({
        title: '디저트',
        keyword: '디저트',
        description:
          '달콤한 디저트와 베이커리류를 선호해요.',
      })
    }

    if (
      allItems.includes('헬스') ||
      allItems.includes('웨이트') ||
      allItems.includes('러닝')
    ) {
      preferences.push({
        title: '운동',
        keyword: '운동',
        description:
          '운동 관련 소비가 반복적으로 나타나요.',
      })
    }

    if (
      allItems.includes('필라테스') ||
      allItems.includes('요가')
    ) {
      preferences.push({
        title: '바디케어',
        keyword: '필라테스·요가',
        description:
          '몸 관리와 관련된 활동을 선호하는 경향이 있어요.',
      })
    }

    if (
      allItems.includes('운동화') ||
      allItems.includes('신발') ||
      allItems.includes('러닝화')
    ) {
      preferences.push({
        title: '신발',
        keyword: '신발',
        description:
          '신발과 운동화 관련 소비가 자주 나타나요.',
      })
    }

    if (
      allItems.includes('옷') ||
      allItems.includes('셔츠') ||
      allItems.includes('바지') ||
      allItems.includes('자켓')
    ) {
      preferences.push({
        title: '패션',
        keyword: '패션',
        description:
          '의류와 패션 상품에 관심이 있어요.',
      })
    }

    if (preferences.length === 0) {
      preferences.push({
        title: `${favoriteCategory} 중심 소비`,
        keyword: favoriteCategory,
        description:
          '현재 입력한 소비내역을 중심으로 취향을 분석하고 있어요.',
      })
    }

    return preferences
  }
// -------------------------
// 소비 영역 간 연결 추천
// -------------------------
const crossCategoryRules = [
  {
    keywords: ['샐러드', '저칼로리', '다이어트', '닭가슴살', '프로틴'],
    trigger: '식단 관리',
    recommendations: [
      {
        title: '주변 헬스장',
        category: '운동',
        store: '내 주변 헬스장',
        reason: '최근 식단 관리 관련 소비가 증가하고 있어 운동 영역을 함께 추천해요.',
      },
      {
        title: '운동용품',
        category: '운동',
        store: '러닝·홈트 용품',
        reason: '식단 관리 흐름과 함께 운동을 시작할 가능성을 고려했어요.',
      },
    ],
  },

  {
    keywords: ['러닝', '러닝화', '운동복', '헬스', '웨이트', '클라이밍'],
    trigger: '운동',
    recommendations: [
      {
        title: '고단백 식단',
        category: '음식',
        store: '단백질 식단 전문점',
        reason: '최근 운동 관련 소비를 바탕으로 운동과 연결되는 식단을 추천해요.',
      },
      {
        title: '프로틴 음료',
        category: '음식',
        store: '프로틴·건강식품',
        reason: '운동 소비가 이어지고 있어 관련 식품을 함께 추천해요.',
      },
    ],
  },

  {
    keywords: ['커피', '아메리카노', '라떼'],
    trigger: '카페',
    recommendations: [
      {
        title: '베이커리 카페',
        category: '디저트',
        store: '베이커리 카페',
        reason: '최근 카페 소비를 바탕으로 함께 이용할 가능성이 높은 영역을 추천해요.',
      },
    ],
  },

  {
    keywords: ['셔츠', '바지', '자켓', '옷', '운동복'],
    trigger: '패션',
    recommendations: [
      {
        title: '신발',
        category: '쇼핑',
        store: '신발·편집숍',
        reason: '최근 패션 소비와 함께 선택할 가능성이 높은 상품을 추천해요.',
      },
    ],
  },
]

const getCrossCategoryRecommendations = () => {
  if (expenses.length === 0) {
    return []
  }

  const results = []

  // 최근 소비 내역을 우선 분석
  const recentExpenses = [...expenses]
    .sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })
    .slice(0, 10)

  const hasKeyword = (keywords) => {
    return recentExpenses.some((expense) =>
      keywords.some((keyword) =>
        String(expense.item)
          .toLowerCase()
          .includes(keyword.toLowerCase())
      )
    )
  }

  // 1. 식단 관리 → 운동
  if (
    hasKeyword([
      '샐러드',
      '다이어트',
      '저칼로리',
      '닭가슴살',
      '프로틴',
      '단백질',
      '건강식',
      '식단',
    ])
  ) {
    results.push({
      title: '주변 헬스장',
      category: '운동',
      store: '내 주변 헬스장',
      trigger: '식단 관리',
      reason:
        '최근 식단 관리 관련 소비가 확인되어 운동 영역의 선택도 함께 추천해요.',
    })

    results.push({
      title: '운동용품',
      category: '운동',
      store: '러닝·홈트 용품',
      trigger: '식단 관리',
      reason:
        '식단 관리와 함께 운동을 시작하거나 지속할 가능성을 고려했어요.',
    })
  }

  // 2. 운동 → 음식
  if (
    hasKeyword([
      '러닝',
      '러닝화',
      '운동복',
      '헬스',
      '웨이트',
      '클라이밍',
      '필라테스',
      '요가',
      '운동',
    ])
  ) {
    results.push({
      title: '고단백 식단',
      category: '음식',
      store: '단백질 식단 전문점',
      trigger: '운동',
      reason:
        '최근 운동 관련 소비를 바탕으로 운동과 연결되는 식단을 추천해요.',
    })

    results.push({
      title: '프로틴 음료',
      category: '음식',
      store: '프로틴·건강식품',
      trigger: '운동',
      reason:
        '운동 소비가 확인되어 운동 후 함께 선택할 수 있는 식품을 추천해요.',
    })
  }

  // 3. 카페 → 디저트
  if (
    hasKeyword([
      '커피',
      '아메리카노',
      '라떼',
      '카페',
      '에스프레소',
    ])
  ) {
    results.push({
      title: '베이커리 카페',
      category: '디저트',
      store: '베이커리 카페',
      trigger: '카페',
      reason:
        '최근 카페 소비와 함께 선택할 가능성이 높은 디저트 영역을 추천해요.',
    })
  }

  // 4. 패션 → 신발
  if (
    hasKeyword([
      '셔츠',
      '바지',
      '자켓',
      '옷',
      '운동복',
      '패션',
      '니트',
      '후드',
    ])
  ) {
    results.push({
      title: '신발',
      category: '쇼핑',
      store: '신발·편집숍',
      trigger: '패션',
      reason:
        '최근 패션 관련 소비를 바탕으로 함께 선택할 가능성이 높은 신발을 추천해요.',
    })
  }

  return results
}

  // -------------------------
// 추천 생성
// -------------------------
const getRecommendations = () => {
  const preferences = analyzePreferences()

  let recommendations = []

  preferences.forEach((preference) => {
    const data = recommendationData[preference.title]

    if (data) {
      recommendations = [
        ...recommendations,
        ...data.map((item) => ({
          ...item,
          preference: preference.title,
        })),
      ]
    }
  })

  // 추천 데이터가 없더라도 기본 추천을 보여줌
  if (recommendations.length === 0) {
    recommendations = [
      {
        name: '새로운 선택지',
        store: '내 주변 추천 매장',
        price: '다양한 가격대',
        distance: '주변',
        score: 85,
        reason:
          '현재 입력한 소비내역을 바탕으로 새로운 선택지를 추천해요.',
        basedOn:
          expenses.length > 0
            ? expenses[0].item
            : '최근 소비내역',
      },
    ]
  }

  // 사용자 반응을 추천 점수에 반영
  recommendations = recommendations.map((item) => {
    const userFeedback = feedback[item.name]

    let adjustedScore = item.score

    if (userFeedback === 'like') {
      adjustedScore += 5
    }

    if (userFeedback === 'dislike') {
      adjustedScore -= 15
    }

    return {
      ...item,
      adjustedScore,
    }
  })

  // 점수 높은 순으로 정렬
  recommendations.sort(
    (a, b) => b.adjustedScore - a.adjustedScore
  )

  return recommendations.slice(0, 5)
}


// -------------------------
// 추천 반응
// -------------------------
const handleFeedback = (name, type) => {
  setFeedback((prev) => ({
    ...prev,
    [name]: type,
  }))
}


// -------------------------
// 추천 상세 페이지 이동
// -------------------------
const openRecommendation = (recommendation) => {
  setSelectedRecommendation(recommendation)
  setPage('detail')
}



  // -------------------------
  // 페이지
  // -------------------------

  if (page === 'home') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>My Choice</h1>
            <p>나를 위한 소비 선택</p>
          </div>
        </header>

        <main className="hero">
          <p className="eyebrow">
            AI PERSONAL RECOMMENDATION
          </p>

          <h2>
            나에게 맞는 선택을
            <br />
            더 쉽게
          </h2>

          <p className="description">
            나의 소비 데이터를 분석하고
            <br />
            다음 선택까지 추천해주는 개인 맞춤형 서비스
          </p>

          <button
            className="start-button"
            onClick={() => setPage('input')}
          >
            소비 분석 시작
          </button>
        </main>

        <section className="category-section">
          <h3>분석 가능한 소비 영역</h3>

          <div className="category-list">
            <div className="category-card">
              <div className="icon">01</div>
              <h4>음식</h4>
              <p>자주 먹는 메뉴와 취향 분석</p>
            </div>

            <div className="category-card">
              <div className="icon">02</div>
              <h4>쇼핑</h4>
              <p>구매 상품과 브랜드 패턴 분석</p>
            </div>

            <div className="category-card">
              <div className="icon">03</div>
              <h4>운동</h4>
              <p>운동 종목과 관련 소비 분석</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (page === 'input') {
    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() => setPage('home')}
        >
          ← 처음으로
        </button>

        <main className="input-page">
          <p className="eyebrow">MY CONSUMPTION</p>

          <h2>최근 소비내역을 입력해주세요.</h2>

          <p className="description">
            실제 구매한 품목을 입력할수록
            <br />
            더 정확한 취향 분석이 가능해요.
          </p>

          <div className="input-box">
            <label>카테고리</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>음식</option>
              <option>카페</option>
              <option>쇼핑</option>
              <option>운동</option>
              <option>문화</option>
              <option>여행</option>
            </select>

            <label>구매 품목</label>

            <input
              type="text"
              placeholder="예: 마라탕"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />

            <label>금액</label>

            <input
              type="number"
              placeholder="예: 12000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              
              
            /><label>구매일</label>

<input
  type="date"
  value={purchaseDate}
  onChange={(e) => setPurchaseDate(e.target.value)}
/>

            <button
              className="add-button"
              onClick={addExpense}
            >
              소비내역 추가
            </button>
          </div>

          {expenses.length > 0 && (
            <div className="expense-list">
              <h3>입력한 소비내역</h3>

              {expenses.map((expense) => (
                <div
                  className="expense-item"
                  key={expense.id}
                >
                  <div>
                    <strong>{expense.item}</strong>

<small>
  {expense.category} · {expense.date}
</small>
                  </div>

                  <span>
                    {expense.amount.toLocaleString()}원
                  </span>
                </div>
              ))}

              <button
                className="analyze-button"
                onClick={() => setPage('result')}
              >
                내 소비 분석하기 →
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (page === 'result') {
    const preferences = analyzePreferences()

    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() => setPage('input')}
        >
          ← 소비내역
        </button>

        <main className="result-page">
          <p className="eyebrow">CONSUMPTION ANALYSIS</p>

          <h2>나의 소비를 분석했어요.</h2>

          <div className="result-card">
            <h3>총 소비금액</h3>

            <p className="big-number">
              {totalAmount.toLocaleString()}원
            </p>
          </div>

          <div className="result-card">
            <h3>가장 많이 소비한 분야</h3>

            <p className="big-number">
              {favoriteCategory}
            </p>
          </div>

          <div className="result-card">
            <h3>분야별 소비</h3>

            {Object.entries(categoryTotal).map(
              ([categoryName, value]) => (
                <div
                  className="analysis-row"
                  key={categoryName}
                >
                  <span>{categoryName}</span>
                  <strong>
                    {value.toLocaleString()}원
                  </strong>
                </div>
              )
            )}
          </div>
<div className="result-card">
  <h3>필요 시점 예측</h3>

  {getNeedPredictions().length > 0 ? (
    getNeedPredictions()
      .slice(0, 5)
      .map((prediction) => (
        <div
          className="prediction-item"
          key={prediction.item}
        >
          <div>
            <strong>{prediction.item}</strong>

            <p>
              평균 {prediction.averageInterval}일 주기로
              구매하고 있어요.
            </p>
          </div>

          <div className="prediction-date">
            <span>다음 예상 시점</span>

            <strong>
              {formatPredictionDate(
                prediction.predictedDate
              )}
            </strong>

            <small>
              {prediction.daysUntil <= 0
                ? '구매 시점이 가까워졌어요.'
                : `${prediction.daysUntil}일 후 예상`}
            </small>
          </div>
        </div>
      ))
  ) : (
    <p className="prediction-empty">
      같은 품목을 2번 이상 구매하면
      <br />
      평균 구매 주기를 계산해 다음 필요 시점을 예측해요.
    </p>
  )}
</div>
          <div className="result-card">
            <h3>발견된 나의 취향</h3>

            {preferences.map((preference) => (
              <div
                className="preference-highlight"
                key={preference.title}
              >
                <strong>{preference.title}</strong>

                <p className="preference-description">
                  {preference.description}
                </p>

                <span>{preference.keyword}</span>
              </div>
            ))}
          </div>

          <button
            className="analyze-button"
            onClick={() => setPage('recommend')}
          >
            나에게 맞는 추천 보기 →
          </button>
        </main>
      </div>
    )
  }
<div className="cross-category-section">
  <h2>소비 흐름을 연결한 추천</h2>

  <p className="cross-category-description">
    최근 소비 흐름을 분석해 다른 소비 영역에서
    함께 필요할 수 있는 선택을 제안해요.
  </p>

  <div className="cross-category-list">
    {getCrossCategoryRecommendations().length > 0 ? (
      getCrossCategoryRecommendations().map(
        (recommendation, index) => (
          <div
            className="cross-category-card"
            key={`${recommendation.title}-${index}`}
          >
            <span className="cross-category-label">
              {recommendation.trigger} → {recommendation.category}
            </span>

            <h3>{recommendation.title}</h3>

            <p className="store-name">
              {recommendation.store}
            </p>

            <p className="cross-category-reason">
              {recommendation.reason}
            </p>

            <small>
              관련 소비 {recommendation.matchedCount}회
            </small>
          </div>
        )
      )
    ) : (
      <div className="cross-category-empty">
        <p>
          다양한 소비가 쌓이면 소비 영역 간 연결 추천이 나타나요.
        </p>
      </div>
    )}
  </div>
</div>
  if (page === 'recommend') {
    const preferences = analyzePreferences()
    const recommendations = getRecommendations()

    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() => setPage('result')}
        >
          ← 분석 결과
        </button>

        <main className="result-page">
          <p className="eyebrow">
            PERSONAL RECOMMENDATION
          </p>

          <h2>
            당신에게 맞는
            <br />
            선택을 찾았어요.
          </h2>

          <p className="description">
            기존 소비내역에서 발견한 취향을 바탕으로
            <br />
            새로운 선택지를 추천해드려요.
          </p>

          <div className="recommend-summary">
            <span>분석된 취향</span>

            <div className="summary-tags">
              {preferences.map((preference) => (
                <span
                  className="summary-tag"
                  key={preference.title}
                >
                  {preference.title}
                </span>
              ))}
            </div>
          </div>

          <h3 className="recommend-title">
            당신을 위한 추천
          </h3>

          <div className="recommend-list">
            {recommendations.map(
              (recommendation, index) => (
                <div
                  className="recommend-card"
                  key={recommendation.name}
                >
                  <div className="recommend-top">
                    <span className="recommend-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="recommend-score">
                      {recommendation.adjustedScore}%
                    </span>
                  </div>

                  <h3>{recommendation.name}</h3>

                  <p className="store-name">
                    {recommendation.store}
                  </p>

                  <div className="recommend-info">
                    <span>
                      {recommendation.price}
                    </span>

                    <span>
                      {recommendation.distance}
                    </span>
                  </div>

                  <div className="recommend-reason">
                    <strong>왜 추천했을까요?</strong>

                    <p>
                      {recommendation.reason}
                    </p>

                    <small>
                      내가 구매한 품목 ·{' '}
                      {recommendation.basedOn}
                    </small>
                  </div>

                  <div className="feedback-buttons">
                    <button
                      className={
                        feedback[recommendation.name] ===
                        'like'
                          ? 'feedback-button active'
                          : 'feedback-button'
                      }
                      onClick={() =>
                        handleFeedback(
                          recommendation.name,
                          'like'
                        )
                      }
                    >
                      관심 있어요
                    </button>

                    <button
                      className={
                        feedback[recommendation.name] ===
                        'dislike'
                          ? 'feedback-button dislike-active'
                          : 'feedback-button'
                      }
                      onClick={() =>
                        handleFeedback(
                          recommendation.name,
                          'dislike'
                        )
                      }
                    >
                      별로예요
                    </button>

                    <button
                      className="detail-button"
                      onClick={() =>
                        openRecommendation(
                          recommendation
                        )
                      }
                    >
                      자세히 보기 →
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <button
            className="analyze-button"
            onClick={() => setPage('input')}
          >
            소비내역 더 입력하기
          </button>
        </main>
      </div>
    )
  }

  // -------------------------
  // 추천 상세 페이지
  // -------------------------

  if (page === 'detail' && selectedRecommendation) {
    const recommendation = selectedRecommendation

    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() => setPage('recommend')}
        >
          ← 추천 목록
        </button>

        <main className="result-page detail-page">
          <p className="eyebrow">
            RECOMMENDATION DETAIL
          </p>

          <h2>{recommendation.name}</h2>

          <p className="store-name detail-store">
            {recommendation.store}
          </p>

          <div className="result-card detail-card">
            <h3>추천 정보</h3>

            <div className="analysis-row">
              <span>가격</span>
              <strong>
                {recommendation.price}
              </strong>
            </div>

            <div className="analysis-row">
              <span>거리</span>
              <strong>
                {recommendation.distance}
              </strong>
            </div>

            <div className="analysis-row">
              <span>추천 적합도</span>
              <strong>
                {recommendation.adjustedScore}%
              </strong>
            </div>
          </div>

          <div className="result-card">
            <h3>왜 나에게 추천했을까요?</h3>

            <p className="detail-reason">
              {recommendation.reason}
            </p>

            <div className="based-on-box">
              <span>나의 기존 소비</span>
              <strong>
                {recommendation.basedOn}
              </strong>
            </div>
          </div>

          <div className="result-card">
            <h3>AI가 학습한 내용</h3>

            <p className="detail-reason">
              내가 이전에 구매한 품목과 추천에 대한
              반응을 바탕으로 추천 적합도를 조정하고 있어요.
            </p>

            <p className="learning-message">
              {feedback[recommendation.name] ===
                'like'
                ? '이 선택에 관심을 보였어요. 다음 추천에서 비슷한 선택의 우선순위를 높입니다.'
                : feedback[recommendation.name] ===
                  'dislike'
                ? '이 선택을 선호하지 않는 것으로 반영했어요. 다음 추천에서 비슷한 선택의 우선순위를 낮춥니다.'
                : '아직 이 추천에 대한 반응이 없어요.'}
            </p>
          </div>

          <div className="detail-feedback">
            <button
              className={
                feedback[recommendation.name] ===
                'like'
                  ? 'feedback-button active'
                  : 'feedback-button'
              }
              onClick={() =>
                handleFeedback(
                  recommendation.name,
                  'like'
                )
              }
            >
              관심 있어요
            </button>

            <button
              className={
                feedback[recommendation.name] ===
                'dislike'
                  ? 'feedback-button dislike-active'
                  : 'feedback-button'
              }
              onClick={() =>
                handleFeedback(
                  recommendation.name,
                  'dislike'
                )
              }
            >
              별로예요
            </button>
          </div>

          <button
            className="analyze-button"
            onClick={() => setPage('recommend')}
          >
            추천 목록으로 돌아가기
          </button>
        </main>
      </div>
    )
  }
}

export default App