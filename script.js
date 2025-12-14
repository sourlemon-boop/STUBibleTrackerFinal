// ==========================================================
// ⚠️ [중요] 이 파일에는 실제 API 키를 넣지 않습니다.
// 키는 .gitignore에 등록된 config.js 파일에서 불러옵니다.
// ==========================================================
// config.js 파일에 있는 YOUR_GEMINI_API_KEY 변수가 로드될 예정입니다.
let GEMINI_API_KEY = null; 

document.addEventListener('DOMContentLoaded', () => {
    // config.js가 로드된 후 키를 변수에 할당합니다.
    if (typeof YOUR_GEMINI_API_KEY !== 'undefined') {
        GEMINI_API_KEY = YOUR_GEMINI_API_KEY;
    }
    setupEventListeners();
});

// ==========================================================
// 0. 전역 변수 설정 및 데이터 정의 (네가 보내준 부분)
// ==========================================================
const BIBLE_BOOKS = {
    "창세기": 50, "출애굽기": 40, "레위기": 27, "민수기": 36, "신명기": 34,
    "여호수아": 24, "사사기": 21, "룻기": 4, "사무엘상": 31, "사무엘하": 24,
    "열왕기상": 22, "열왕기하": 25, "역대상": 29, "역대하": 36, "에스라": 10,
    "느헤미야": 13, "에스더": 10, "욥기": 42, "시편": 150, "잠언": 31,
    "전도서": 12, "아가": 8, "이사야": 66, "예레미야": 52, "예레미야애가": 5,
    "에스겔": 48, "다니엘": 12, "호세아": 14, "요엘": 3, "아모스": 9,
    "오바댜": 1, "요나": 4, "미가": 7, "나훔": 3, "하박국": 3,
    "스바냐": 3, "학개": 2, "스가랴": 14, "말라기": 4, 
    "마태복음": 28, "마가복음": 16, "누가복음": 24, "요한복음": 21,
    "사도행전": 28, "로마서": 16, "고린도전서": 16, "고린도후서": 13,
    "갈라디아서": 6, "에베소서": 6, "빌립보서": 4, "골로새서": 4,
    "데살로니가전서": 5, "데살로니가후서": 3, "디모데전서": 6, "디모데후서": 4,
    "디도서": 3, "빌레몬서": 1, "히브리서": 13, "야고보서": 5,
    "베드로전서": 5, "베드로후서": 3, "요한일서": 5, "요한이서": 1,
    "요한삼서": 1, "유다서": 1, "요한계시록": 22
};

const KOREAN_TO_ENGLISH = {
    "창세기": "Genesis", "출애굽기": "Exodus", "레위기": "Leviticus", "민수기": "Numbers", "신명기": "Deuteronomy",
    "여호수아": "Joshua", "사사기": "Judges", "룻기": "Ruth", "사무엘상": "1 Samuel", "사무엘하": "2 Samuel",
    "열왕기상": "1 Kings", "열왕기하": "2 Kings", "역대상": "1 Chronicles", "역대하": "2 Chronicles", "에스라": "Ezra",
    "느헤미야": "Nehemiah", "에스더": "Esther", "욥기": "Job", "시편": "Psalms", "잠언": "Proverbs",
    "전도서": "Ecclesiastes", "아가": "Song of Solomon", "이사야": "Isaiah", "예레미야": "Jeremiah", "예레미야애가": "Lamentations",
    "에스겔": "Ezekiel", "다니엘": "Daniel", "호세아": "Hosea", "요엘": "Joel", "아모스": "Amos",
    "오바댜": "Obadiah", "요나": "Jonah", "미가": "Micah", "나훔": "Nahum", "하박국": "Habakkuk",
    "스바냐": "Zephaniah", "학개": "Haggai", "스가랴": "Zechariah", "말라기": "Malachi", 
    "마태복음": "Matthew", "마가복음": "Mark", "누가복음": "Luke", "요한복음": "John",
    "사도행전": "Acts", "로마서": "Romans", "고린도전서": "1 Corinthians", "고린도후서": "2 Corinthians",
    "갈라디아서": "Galatians", "에베소서": "Ephesians", "빌립보서": "Philippians", "골로새서": "Colossians",
    "데살로니가전서": "1 Thessalonians", "데살로니가후서": "2 Thessalonians", "디모데전서": "1 Timothy", "디모데후서": "2 Timothy",
    "디도서": "Titus", "빌레몬서": "Philemon", "히브리서": "Hebrews", "야고보서": "James",
    "베드로전서": "1 Peter", "베드로후서": "2 Peter", "요한일서": "1 John", "요한이서": "2 John",
    "요한삼서": "3 John", "유다서": "Jude", "요한계시록": "Revelation"
};

let totalChapters = 0;
for (const book in BIBLE_BOOKS) {
    totalChapters += BIBLE_BOOKS[book];
}

let currentUserName = null;
let readingRecords = {};
let recordKey = null;

const BIBLE_API_URL = 'https://bible-api.com/'; 

// ==========================================================
// 1. 로그인/로그아웃 처리 로직
// (나머지 함수들은 모두 여기에 있다고 가정하고 아래에 이어서 작성합니다)
// ==========================================================

function loginSuccess(userName) {
    currentUserName = userName;
    recordKey = `bibleRecords_${userName}`;
    readingRecords = JSON.parse(localStorage.getItem(recordKey)) || {};

    document.getElementById('login-form-area').style.display = 'none';
    document.getElementById('user-info-area').style.display = 'block';

    document.getElementById('panel-title').textContent = "기록 확인";
    document.getElementById('app-title').textContent = `📖 ${userName}님의 통독 트래커`;
    document.getElementById('logged-in-user').textContent = userName;
    
    startTrackerApp(); 
}

function logoutUser() {
    currentUserName = null;
    readingRecords = {};
    localStorage.removeItem('userName'); 

    document.getElementById('login-form-area').style.display = 'block';
    document.getElementById('user-info-area').style.display = 'none';
    document.getElementById('panel-title').textContent = "기록 시작";
    document.getElementById('app-title').textContent = `📖 성경 통독 트래커`;
    document.getElementById('username').value = '';

    document.getElementById('bible-list').innerHTML = '<p>로그인 후 목록을 불러올 수 있습니다.</p>';
    document.getElementById('progress-text').textContent = `현재 0장 / ${totalChapters}장 (0%) 통독`;
    document.getElementById('progress-bar').style.width = '0%';
}

function setupLoginLogic() {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const usernameInput = document.getElementById('username');
    const messageElement = document.getElementById('login-message');

    loginButton.addEventListener('click', () => {
        const enteredName = usernameInput.value.trim();
        
        if (enteredName.length < 2) {
            messageElement.textContent = "이름을 두 글자 이상 입력해 주세요.";
            usernameInput.value = ''; 
            return;
        }
        
        localStorage.setItem('userName', enteredName); 
        messageElement.textContent = '';
        loginSuccess(enteredName);
    });

    logoutButton.addEventListener('click', logoutUser);
    
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    const storedUser = localStorage.getItem('userName');
    
    logoutUser(); 
    
    if (storedUser) {
        usernameInput.value = storedUser;
    }
}

// ==========================================================
// 2. ✨ 핵심 API 기능: 랜덤 성경 구절 + Gemini 기도문 생성
// ==========================================================

function fetchRandomVerse() {
    const quoteContent = document.getElementById('quote-content');
    const prayerText = document.getElementById('prayer-text');
    
    // 로딩 표시
    quoteContent.innerHTML = `<p id="quote-text">말씀을 불러오는 중... 🙏</p><p id="quote-reference"></p>`;
    if(prayerText) prayerText.textContent = "말씀을 묵상하며 기도문을 적고 있어요... ✍️";

    const koreanBookNames = Object.keys(BIBLE_BOOKS);
    const randomKoreanBook = koreanBookNames[Math.floor(Math.random() * koreanBookNames.length)];
    const chapterCount = BIBLE_BOOKS[randomKoreanBook];
    const randomChapter = Math.floor(Math.random() * chapterCount) + 1;
    const englishBookName = KOREAN_TO_ENGLISH[randomKoreanBook];
    const verseReference = `${englishBookName} ${randomChapter}:1`; 
    
    const apiUrl = `${BIBLE_API_URL}${encodeURIComponent(verseReference)}?translation=kjv`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("API 호출 실패");
            return response.json();
        })
        .then(data => {
            const verseText = data.text.trim();
            const verseRef = data.reference;
            const translationName = data.translation_name;

            document.getElementById('quote-text').textContent = `"${verseText}"`;
            document.getElementById('quote-reference').textContent = `- ${verseRef} (${translationName})`;

            fetchPrayerAutoDetect(verseText);
        })
        .catch(error => {
            console.error('오류:', error);
            document.getElementById('quote-text').textContent = 
                `"The Lord is my shepherd; I shall not want."`;
            document.getElementById('quote-reference').textContent = `- Psalms 23:1`;
            if(prayerText) prayerText.textContent = "인터넷 연결을 확인해주세요.";
        });
}

// ✨ 사용 가능한 모델을 자동으로 찾아서 요청하는 함수
async function fetchPrayerAutoDetect(verseText) {
    const prayerTextElement = document.getElementById('prayer-text');
    if (!prayerTextElement) return;

    if (!GEMINI_API_KEY) {
        prayerTextElement.textContent = "⚠️ config.js에 API 키를 입력하거나, 파일 로드 순서를 확인해주세요!";
        return;
    }

    const cleanKey = GEMINI_API_KEY.trim();

    try {
        // 1단계: 어떤 모델이 있는지 목록을 가져와서 유효한 모델 이름을 찾음
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
        const listResponse = await fetch(listUrl);
        
        if (!listResponse.ok) {
            throw new Error(`키가 잘못되었거나 서버 접속 불가 (${listResponse.status})`);
        }
        
        const listData = await listResponse.json();
        
        const validModel = listData.models.find(model => 
            model.name.includes('gemini') && 
            model.supportedGenerationMethods.includes('generateContent')
        );

        if (!validModel) {
            throw new Error("사용 가능한 Gemini 모델을 찾을 수 없어요.");
        }

        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${cleanKey}`;
        
        const prompt = `
        역할: 너는 따뜻하고 공감 능력이 뛰어난 크리스천 친구야.
        명령: 아래 성경 말씀을 바탕으로, 오늘 하루 힘과 위로를 얻을 수 있는 2~3문장의 짧은 기도문을 한글로 작성해줘. 
        조건: 말투는 "하나님, ~하게 해주세요" 처럼 부드럽고 편안한 구어체를 써줘.
        성경 말씀: "${verseText}"
        `;

        // 3단계: 찾은 모델 이름으로 진짜 요청 보내기
        const response = await fetch(generateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`AI 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            prayerTextElement.textContent = data.candidates[0].content.parts[0].text;
        } else {
            prayerTextElement.textContent = "기도를 생각하는 중 오류가 발생했어요.";
        }

    } catch (error) {
        console.error("Gemini Error:", error);
        prayerTextElement.textContent = `기도를 작성하지 못했어요. (${error.message})`;
    }
}

// ==========================================================
// 3. 기타 핵심 앱 기능
// ==========================================================

function updateProgress() {
    let completedChapters = 0;
    for (const book in readingRecords) {
        for (const chapter in readingRecords[book]) {
            if (readingRecords[book][chapter] === true) completedChapters++;
        }
    }
    const percentage = ((completedChapters / totalChapters) * 100); 
    document.getElementById('progress-bar').style.width = percentage.toFixed(2) + '%';
    document.getElementById('progress-text').textContent = `현재 ${completedChapters}장 / ${totalChapters}장 (${percentage.toFixed(2)}%) 통독`;

    if (percentage >= 100) {
        document.getElementById('congratulations-area').style.display = 'block';
        launchConfetti(100); 
    } else {
        document.getElementById('congratulations-area').style.display = 'none';
    }
}
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const [bookName, chapterNum] = checkbox.value.split('-');
    
    if (!readingRecords[bookName]) readingRecords[bookName] = {};
    readingRecords[bookName][chapterNum] = checkbox.checked;
    
    localStorage.setItem(recordKey, JSON.stringify(readingRecords));
    updateProgress();
}

function renderBibleList() {
    const listContainer = document.getElementById('bible-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    for (const book in BIBLE_BOOKS) {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-container';
        
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
        
        const bookTitle = document.createElement('div');
        bookTitle.className = 'book-title';
        bookTitle.textContent = book;
        headerDiv.appendChild(bookTitle);

        const selectAllButton = document.createElement('button');
        selectAllButton.className = 'select-all-btn';
        selectAllButton.textContent = '전체 선택';
        selectAllButton.dataset.book = book; 
        headerDiv.appendChild(selectAllButton);
        bookDiv.appendChild(headerDiv); 

        const chapterList = document.createElement('div');
        chapterList.className = 'chapter-checkbox-list';

        for (let i = 1; i <= BIBLE_BOOKS[book]; i++) {
            const chapterId = `${book}-${i}`;
            const isChecked = (readingRecords[book] || {})[i];

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = chapterId;
            input.value = chapterId;
            input.checked = isChecked || false;
            input.addEventListener('change', handleCheckboxChange);

            const label = document.createElement('label');
            label.htmlFor = chapterId;
            label.textContent = i;
            chapterList.appendChild(input);
            chapterList.appendChild(label);
        }
        bookDiv.appendChild(chapterList);
        listContainer.appendChild(bookDiv);
    }
    setupSelectAllButtons(); 
}

function setupSelectAllButtons() {
    document.querySelectorAll('.select-all-btn').forEach(button => {
        button.addEventListener('click', toggleSelectAll);
    });
}

function toggleSelectAll(event) {
    const button = event.target;
    const bookName = button.dataset.book;
    const shouldCheck = button.textContent.includes('전체 선택'); 
    
    const container = button.closest('.book-container');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    if (!readingRecords[bookName]) readingRecords[bookName] = {};
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = shouldCheck; 
        readingRecords[bookName][index + 1] = shouldCheck;
    });

    localStorage.setItem(recordKey, JSON.stringify(readingRecords));
    button.textContent = shouldCheck ? '전체 해제' : '전체 선택';
    updateProgress();
}

function launchConfetti(count) {
    const colors = ['#ffd700', '#4CAF50', '#2196F3', '#f44336', '#FFC0CB'];
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationName = 'fall'; 
        confetti.style.animationFillMode = 'forwards'; 
        confetti.style.animationDuration = Math.random() * 4 + 5 + 's';
        confetti.style.animationDelay = Math.random() * 1 + 's';
        document.body.appendChild(confetti);
        confetti.addEventListener('animationend', () => confetti.remove());
    }
}

function setupEventListeners() {
    setupLoginLogic();
    const refreshButton = document.getElementById('refresh-quote-button');
    if (refreshButton) refreshButton.addEventListener('click', fetchRandomVerse);
}

function startTrackerApp() {
    fetchRandomVerse(); 
    renderBibleList(); 
    updateProgress();
}
