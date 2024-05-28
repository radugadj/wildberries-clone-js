'use strict';

let page = 1;
let fetching = false;
let allImagesLoaded = false;

let boards = {};

// Функция для загрузки и создания карточек изображений
const fetchAndCreateCards = async () => {
    try {
        const container = document.getElementById('main');
        const cols = Array.from(container.getElementsByClassName('col'));

        const savedCards = localStorage.getItem('dogImages');
        if (savedCards) {
            const cardsData = JSON.parse(savedCards);
            cardsData.forEach((image, index) => {
                createCard(image, cols[index % cols.length]);
            });
            hideLoader();
        } else {
            const response = await fetch(`https://dog.ceo/api/breeds/image/random/20`);
            const data = await response.json();
            if (data.message.length > 0) {
                localStorage.setItem('dogImages', JSON.stringify(data.message));
                data.message.forEach((image, index) => {
                    createCard(image, cols[index % cols.length]);
                });
                hideLoader();
            }
        }
    } catch (error) {
        console.error("Error fetching and creating cards:", error);
    }
};

// Функция для скрытия лоадера
const hideLoader = () => {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
};

// Функция для открытия модального окна
const openModal = (image, author, avatar, caption) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="modal-img-container">
                <img src="${image}" alt="Случайное изображение собаки" class="modal-img">
            </div>
            <div class="modal-info">
                <img src="${avatar}" alt="Аватар автора" class="modal-avatar">
                <p class="modal-author">Автор: ${author}</p>
                <button class="add-to-board-button">Добавить в доску</button>
            </div>
        </div>
    `;
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = function () {
        modal.style.display = 'none';
        localStorage.setItem('modalOpen', false);
    };

    const addToBoardButton = modal.querySelector('.add-to-board-button');
    addToBoardButton.onclick = function () {
        openBoardSelectionModal(image, author, avatar);
    };

    document.body.appendChild(modal);
    modal.style.display = 'block';
    localStorage.setItem('modalState', JSON.stringify({ image, author, avatar, caption }));
    localStorage.setItem('modalOpen', true);

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            localStorage.setItem('modalOpen', false);
        }
    };
};

// Функция для открытия модального окна, если оно должно быть открытым
const modalOpen = localStorage.getItem('modalOpen');
if (modalOpen === 'true') {
    const savedState = JSON.parse(localStorage.getItem('modalState'));
    const savedImage = savedState.image;
    const savedAuthor = savedState.author;
    const savedAvatar = savedState.avatar;
    openModal(savedImage, savedAuthor, savedAvatar, '');
}

// Функция для создания карточки с изображением
const createCard = async (image, col) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const randomAvatar = await fetchRandomAvatar().catch(error => {
        console.error("Error fetching random avatar:", error);
        return 'default-avatar.png';
    });

    const authorName = generateRandomAuthor();

    card.innerHTML = `
        <div class="card__image">
            <img src="${image}" alt="Random Dog Image" style="width: 100%;">
        </div>
        <div class="card__info">
            <div class="card__avatar">
                <img src="${randomAvatar}" alt="Author Avatar" class="avatar__img" style="width: 20px; height: 20px;">
            </div>
            <p class="card__name">${authorName}</p>
        </div>
    `;

    const img = card.querySelector('.card__image img');
    img.onerror = function () {
        this.parentElement.style.display = "none";
    };

    img.addEventListener('click', function () {
        openModal(image, authorName, randomAvatar, "");
    });

    col.appendChild(card);
};

// Функция для генерации случайного аватара
const fetchRandomAvatar = async () => {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("Error fetching random avatar:", error);
        return null;
    }
};

// Функция для генерации случайного имени автора
const generateRandomAuthor = () => {
    const authors = ["John", "Jane", "Alex", "Alice", "Michael", "Emily", "David", "Sophia"];
    return authors[Math.floor(Math.random() * authors.length)];
};

// Функция для открытия модального окна выбора доски
const openBoardSelectionModal = (image, author, avatar) => {
    const boardSelectionModal = document.getElementById('board-selection-modal');
    const boardSelectionList = document.getElementById('board-selection-list');
    boardSelectionList.innerHTML = '';

    for (const boardName in boards) {
        const listItem = document.createElement('li');
        const counter = document.createElement('span');
        counter.textContent = ` (${boards[boardName].length})`;
        listItem.textContent = boardName;
        listItem.appendChild(counter);
        listItem.addEventListener('click', () => {
            addToBoard(boardName, image, author, avatar);
            boardSelectionModal.style.display = 'none';
        });
        boardSelectionList.appendChild(listItem);
    }

    boardSelectionModal.style.display = 'block';
    window.onclick = function (event) {
        if (event.target === boardSelectionModal) {
            boardSelectionModal.style.display = "none";
        }
    };
};

// Функция для добавления карточки в доску
const addToBoard = (boardName, image, author, avatar) => {
    if (!boards[boardName]) {
        boards[boardName] = [];
    }
    boards[boardName].push({ image, author, avatar });
    localStorage.setItem('boards', JSON.stringify(boards));
    updateBoardsWindow();
};

// Функция для обновления списка досок
const updateBoardsWindow = () => {
    const boardList = document.getElementById('board-list');
    boardList.innerHTML = '';

    for (const boardName in boards) {
        const listItem = document.createElement('li');
        const counter = document.createElement('span');
        counter.textContent = ` (${boards[boardName].length})`;
        listItem.textContent = boardName;
        listItem.appendChild(counter);
        listItem.addEventListener('click', () => {
            openBoardSelectionModal(boardName);
        });
        boardList.appendChild(listItem);
    }
};

// Функция для очистки всех карточек в досках
const clearAllBoardCards = () => {
    for (const boardName in boards) {
        boards[boardName] = [];
    }
    localStorage.setItem('boards', JSON.stringify(boards));
    updateBoardsWindow();
};

// Обработчик для кнопки очистки всех карточек в досках
document.getElementById('clear-boards-button').addEventListener('click', () => {
    if (confirm("Вы уверены, что хотите очистить все карточки на всех досках?")) {
        clearAllBoardCards();
    }
});

// Событие для открытия окна создания доски
document.getElementById('boards-button').addEventListener('click', () => {
    const boardName = prompt("Введите название новой доски:");
    if (boardName) {
        if (!boards[boardName]) {
            boards[boardName] = [];
            localStorage.setItem('boards', JSON.stringify(boards));
            updateBoardsWindow();
        } else {
            alert("Доска с таким названием уже существует.");
        }
    }
});

// Событие для открытия окна просмотра досок
document.getElementById('view-boards-button').addEventListener('click', () => {
    const boardModal = document.getElementById('board-modal');
    boardModal.style.display = 'block';
    window.onclick = function (event) {
        if (event.target === boardModal) {
            boardModal.style.display = "none";
        }
    };
});

// Закрытие модального окна для просмотра досок
document.querySelectorAll('.close').forEach(button => {
    button.onclick = function () {
        this.closest('.modal').style.display = 'none';
    };
});

// Инициализация сохраненных досок из localStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const savedBoards = localStorage.getItem('boards');
    if (savedBoards) {
        boards = JSON.parse(savedBoards);
        updateBoardsWindow();
    }
    fetchAndCreateCards();
});
