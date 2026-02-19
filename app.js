const sections = [
  {
    name: 'Сервис и гостеприимство',
    pageTitle: 'Как общаться с гостем',
    keywords: ['гость', 'привет', 'улыб', 'сервис', 'жалоб', 'общени', 'эмпат'],
  },
  {
    name: 'Качество напитков',
    pageTitle: 'Стандарты приготовления',
    keywords: ['эспрессо', 'молок', 'температур', 'капучино', 'латте', 'рецепт', 'зерн'],
  },
  {
    name: 'Операционные процессы',
    pageTitle: 'Ежедневная дисциплина',
    keywords: ['смен', 'открыт', 'закрыт', 'касс', 'уборк', 'чистот', 'инвентар'],
  },
  {
    name: 'Бренд и коммуникация',
    pageTitle: 'Тон и визуальный стиль',
    keywords: ['бренд', 'стиль', 'коммуникац', 'соцсет', 'контент', 'тон'],
  },
];

const PAGE_ITEM_LIMIT = 4;

const rawInput = document.getElementById('rawInput');
const buildButton = document.getElementById('buildButton');
const bookContainer = document.getElementById('bookContainer');
const summary = document.getElementById('summary');
const pageTemplate = document.getElementById('pageTemplate');

function normalizeSentence(sentence) {
  const clean = sentence.replace(/\s+/g, ' ').trim();
  if (!clean) {
    return '';
  }

  const withCapital = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?…]$/.test(withCapital) ? withCapital : `${withCapital}.`;
}

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map(normalizeSentence)
    .filter(Boolean);
}

function pickSection(sentence) {
  const base = sentence.toLowerCase();
  let best = sections[0];
  let bestScore = -1;

  for (const section of sections) {
    const score = section.keywords.reduce(
      (acc, keyword) => acc + (base.includes(keyword) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      best = section;
      bestScore = score;
    }
  }

  return best;
}

function buildBook(sentences) {
  const grouped = new Map(sections.map((section) => [section.name, []]));

  for (const sentence of sentences) {
    const section = pickSection(sentence);
    grouped.get(section.name).push(sentence);
  }

  const pages = [];
  for (const section of sections) {
    const items = grouped.get(section.name);
    if (!items.length) {
      continue;
    }

    for (let i = 0; i < items.length; i += PAGE_ITEM_LIMIT) {
      pages.push({
        sectionName: section.name,
        pageTitle: section.pageTitle,
        bullets: items.slice(i, i + PAGE_ITEM_LIMIT),
      });
    }
  }

  return pages;
}

function renderPages(pages) {
  bookContainer.innerHTML = '';

  if (!pages.length) {
    summary.textContent = 'Добавьте мысли, чтобы сформировать структуру.';
    return;
  }

  summary.textContent = `Сформировано пунктов: ${pages.reduce((acc, p) => acc + p.bullets.length, 0)} · Страниц: ${pages.length}`;

  pages.forEach((page, index) => {
    const node = pageTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.section-name').textContent = page.sectionName;
    node.querySelector('.page-number').textContent = `Стр. ${index + 1}`;
    node.querySelector('.page-title').textContent = page.pageTitle;

    const list = node.querySelector('.page-list');
    page.bullets.forEach((bullet) => {
      const li = document.createElement('li');
      li.textContent = bullet;
      list.appendChild(li);
    });

    bookContainer.appendChild(node);
  });
}

buildButton.addEventListener('click', () => {
  const sentences = splitIntoSentences(rawInput.value);
  const pages = buildBook(sentences);
  renderPages(pages);
});

rawInput.value =
  'Бариста должны приветствовать гостя в течение 5 секунд и предлагать помощь с выбором напитка. ' +
  'Молоко хранить при температуре +2...+4°C и взбивать до шелковистой текстуры без крупных пузырей. ' +
  'Перед открытием смены проверять чистоту стойки, работу кофемашины и наличие расходников. ' +
  'В социальных сетях сеть кофеен использует дружелюбный тон и отвечает на комментарии в течение суток.';

renderPages(buildBook(splitIntoSentences(rawInput.value)));
