// 要素の取得
const memoElement = document.getElementById('memo');
const memoListRightElement = document.getElementById('memo-list-right');
const addNoteButton = document.getElementById('add-note');
const removeNoteButton = document.getElementById('remove-note');
const clearAllButton = document.getElementById('clear-all');
const exportNotesButton = document.getElementById('export-notes');

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

    const newMemo = {
        id: newId,
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

    // 右側のメモリストでアクティブなメモをハイライト
    const listItems = memoListRightElement.querySelectorAll('.memo-list-item');
    listItems.forEach(item => {
        if (item.dataset.id === memoId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
};

// メモリストをレンダリングする
const renderMemoList = () => {
    memoListRightElement.innerHTML = '';

    Object.values(memoData).forEach(memo => {
        const listItem = document.createElement('li');
        listItem.className = 'memo-list-item';
        if (memo.id === currentMemoId) {
            listItem.classList.add('active');
        }

        // 本文の1行目をタイトルとして使用（改行文字で分割して最初の行を取得）
        const firstLine = memo.content ? memo.content.split('\n')[0] : '無題のメモ';
        // タイトルが長すぎる場合は省略
        const title = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;

        listItem.textContent = title;
        listItem.dataset.id = memo.id;
        listItem.addEventListener('click', () => {
            selectMemo(memo.id);
        });
        memoListRightElement.appendChild(listItem);
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

// メモをエクスポートする
const exportNotes = () => {
    // localStorageから最新のメモデータを取得
    const dataStr = JSON.stringify(memoData, null, 2);

    // データをBlobとして作成
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'notes-export.json';

    // リンクをクリックしてダウンロードを開始
    link.click();
};

// リサイズハンドラーの設定
const setupResizeHandler = () => {
    const resizeHandle = document.getElementById('resize-handle');
    const memoListContainer = document.getElementById('memo-list-container');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        // ビューポートの幅を取得
        const viewportWidth = window.innerWidth;

        // メモリストコンテナの新しい幅を計算（右端からの距離）
        const newWidth = viewportWidth - e.clientX - 30; // 30pxはパディング等の調整値

        // 幅の最小値と最大値を設定
        if (newWidth > 150 && newWidth < 600) {
            memoListContainer.style.width = `${newWidth}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
    });
};

// イベントリスナーの設定
const setupEventListeners = () => {
    // メモが変更されたら自動保存
    memoElement.addEventListener('input', updateCurrentMemo);

    // Add Noteボタン
    addNoteButton.addEventListener('click', () => {
        const newId = createNewMemo();
        selectMemo(newId);
    });

    // Remove Noteボタン
    removeNoteButton.addEventListener('click', removeCurrentMemo);

    // Clear Allボタン
    clearAllButton.addEventListener('click', clearAllMemos);

    // Export Notesボタン
    exportNotesButton.addEventListener('click', exportNotes);
};

// ページ読み込み時の初期化
window.addEventListener('DOMContentLoaded', () => {
    loadMemoData();
    renderMemoList();
    setupEventListeners();
    setupResizeHandler(); // リサイズハンドラーの設定を追加

    // 最初のメモを選択
    if (currentMemoId) {
        selectMemo(currentMemoId);
    }
});