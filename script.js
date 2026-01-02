// 要素の取得
const memoElement = document.getElementById('memo');
const memoTitleElement = document.getElementById('memo-title');
const memoListElement = document.getElementById('memo-list');
const addNoteButton = document.getElementById('add-note');
const removeNoteButton = document.getElementById('remove-note');
const clearAllButton = document.getElementById('clear-all');

// メモデータのキー
const MEMO_DATA_KEY = 'memoData';

// 現在選択中のメモID
let currentMemoId = null;

// メモデータの初期化
let memoData = {};

// localStorageからメモデータを読み込む
const loadMemoData = () => {
    const savedData = localStorage.getItem(MEMO_DATA_KEY);
    if (savedData) {
        memoData = JSON.parse(savedData);
        // 既存のメモデータにタイトルがない場合の処理
        Object.values(memoData).forEach(memo => {
            if (!memo.title) {
                memo.title = `メモ ${Object.keys(memoData).length}`;
            }
        });
    } else {
        // 初期メモを作成
        createNewMemo();
    }
};

// メモデータをlocalStorageに保存する
const saveMemoData = () => {
    localStorage.setItem(MEMO_DATA_KEY, JSON.stringify(memoData));
};

// 新しいメモを作成する
const createNewMemo = () => {
    const newId = Date.now().toString();
    const now = new Date();
    const defaultTitle = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-');

    const newMemo = {
        id: newId,
        title: defaultTitle,
        content: '',
        createdAt: now.toISOString()
    };

    memoData[newId] = newMemo;
    currentMemoId = newId;
    saveMemoData();
    renderMemoList();
    selectMemo(newId);
    return newId;
};

// メモを選択する
const selectMemo = (memoId) => {
    if (!memoData[memoId]) return;

    currentMemoId = memoId;
    memoElement.value = memoData[memoId].content || '';
    memoTitleElement.value = memoData[memoId].title || '';

    // 選択中のメモをリストでハイライト
    Array.from(memoListElement.options).forEach(option => {
        option.selected = option.value === memoId;
    });
};

// メモリストをレンダリングする
const renderMemoList = () => {
    memoListElement.innerHTML = '';

    Object.values(memoData).forEach(memo => {
        const option = document.createElement('option');
        option.value = memo.id;
        option.textContent = memo.title;
        memoListElement.appendChild(option);
    });

    // 現在のメモを選択状態にする
    if (currentMemoId) {
        selectMemo(currentMemoId);
    }
};

// 現在のメモを更新する
const updateCurrentMemo = () => {
    if (currentMemoId && memoData[currentMemoId]) {
        memoData[currentMemoId].content = memoElement.value;
        saveMemoData();
    }
};

// 現在のメモのタイトルを更新する
const updateCurrentMemoTitle = () => {
    if (currentMemoId && memoData[currentMemoId]) {
        // 空のタイトルの場合、現在日時を設定
        if (memoTitleElement.value.trim() === '') {
            const now = new Date();
            memoData[currentMemoId].title = now.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-');
        } else {
            memoData[currentMemoId].title = memoTitleElement.value;
        }
        saveMemoData();
        renderMemoList(); // メモリストを再描画してタイトル変更を反映
    }
};

// 選択中のメモを削除する
const removeCurrentMemo = () => {
    if (!currentMemoId) return;

    if (Object.keys(memoData).length <= 1) {
        alert('最後のメモは削除できません。');
        return;
    }

    delete memoData[currentMemoId];

    // 新しい現在のメモを選択
    const remainingIds = Object.keys(memoData);
    currentMemoId = remainingIds.length > 0 ? remainingIds[0] : null;

    saveMemoData();
    renderMemoList();

    if (currentMemoId) {
        selectMemo(currentMemoId);
    } else {
        memoElement.value = '';
    }
};

// すべてのメモをクリアする
const clearAllMemos = () => {
    if (confirm('本当にすべてのメモを削除しますか？')) {
        memoData = {};
        currentMemoId = null;
        saveMemoData();
        createNewMemo();
    }
};

// イベントリスナーの設定
const setupEventListeners = () => {
    // メモが変更されたら自動保存
    memoElement.addEventListener('input', updateCurrentMemo);

    // メモタイトルが変更されたら自動保存
    memoTitleElement.addEventListener('input', updateCurrentMemoTitle);

    // メモリストの選択変更
    memoListElement.addEventListener('change', (e) => {
        selectMemo(e.target.value);
    });

    // Add Noteボタン
    addNoteButton.addEventListener('click', () => {
        const newId = createNewMemo();
        selectMemo(newId);
    });

    // Remove Noteボタン
    removeNoteButton.addEventListener('click', removeCurrentMemo);

    // Clear Allボタン
    clearAllButton.addEventListener('click', clearAllMemos);
};

// ページ読み込み時の初期化
window.addEventListener('DOMContentLoaded', () => {
    loadMemoData();
    renderMemoList();
    setupEventListeners();

    // 最初のメモを選択
    if (currentMemoId) {
        selectMemo(currentMemoId);
    }
});