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
            hideLoader(); // Скрыть лоадер после создания карточек
        } else {
            const response = await fetch(`https://dog.ceo/api/breeds/image/random/20`);
            const data = await response.json();
            if (data.message.length > 0) {
                localStorage.setItem('dogImages', JSON.stringify(data.message));
                data.message.forEach((image, index) => {
                    createCard(image, cols[index % cols.length]);
                });
                hideLoader(); // Скрыть лоадер после создания карточек
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
    const modal = document.getElementById('card-modal');
    const modalContent = modal.querySelector('.modal-content');
    const closeButton = modalContent.querySelector('.close');
    const addToBoardButton = modalContent.querySelector('.add-to-board-button');

    const modalImgContainer = document.createElement('div');
    modalImgContainer.classList.add('modal-img-container');
    const modalImg = document.createElement('img');
    modalImg.src = image;
    modalImg.alt = "Random Dog Image";
    modalImg.classList.add('modal-img');
    const modalInfo = document.createElement('div');
    modalInfo.classList.add('modal-info');
    const modalAvatar = document.createElement('img');
    modalAvatar.src = avatar;
    modalAvatar.alt = "Author Avatar";
    modalAvatar.classList.add('modal-avatar');
    const modalAuthor = document.createElement('p');
    modalAuthor.textContent = "Author: " + author;
    modalAuthor.classList.add('modal-author');

    modalImgContainer.appendChild(modalImg);
    modalInfo.appendChild(modalAvatar);
    modalInfo.appendChild(modalAuthor);

    modalContent.insertBefore(modalImgContainer, addToBoardButton);
    modalContent.insertBefore(modalInfo, addToBoardButton);

    closeButton.onclick = function () {
        modal.style.display = 'none';
        while (modalContent.firstChild) {
            modalContent.removeChild(modalContent.firstChild);
        }
        modalContent.appendChild(closeButton);
        modalContent.appendChild(addToBoardButton);
        localStorage.setItem('modalOpen', false);
    };

    addToBoardButton.onclick = function () {
        openBoardSelectionModal(image, author, avatar);
    };

    modal.style.display = 'block';
    localStorage.setItem('modalState', JSON.stringify({ image, author, avatar, caption }));
    localStorage.setItem('modalOpen', true);
};

// Функция для открытия модального окна
const modalOpen = localStorage.getItem('modalOpen');
if (modalOpen === 'true') {
    // Открываем модальное окно, если оно должно быть открытым
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
    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card__info');
    const cardImage = document.createElement('div');
    cardImage.classList.add('card__image');
    const img = document.createElement('img');
    img.src = image;
    img.alt = "Random Dog Image";
    img.style.width = "100%";
    img.onerror = function () {
        this.parentElement.style.display = "none";
    };

    const cardAvatar = document.createElement('div');
    cardAvatar.classList.add('card__avatar');
    const avatarImg = document.createElement('img');
    avatarImg.classList.add('avatar__img');
    avatarImg.alt = "Author Avatar";
    avatarImg.style.width = "20px";
    avatarImg.style.height = "20px";

    try {
        const randomAvatar = await fetchRandomAvatar();
        avatarImg.src = randomAvatar;
    } catch (error) {
        console.error("Error fetching random avatar:", error);
    }

    const authorName = generateRandomAuthor();
    const authorElement = document.createElement('p');
    authorElement.classList.add('card__name');
    authorElement.textContent = authorName;

    img.addEventListener('click', function () {
        openModal(image, authorName, avatarImg.src, "");
    });

    card.appendChild(cardImage);
    cardImage.appendChild(img);
    cardInfo.appendChild(cardAvatar);
    cardAvatar.appendChild(avatarImg);
    cardInfo.appendChild(authorElement);
    card.appendChild(cardInfo);

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
        throw error;
    }
};

// Функция для генерации случайного имени автора
const generateRandomAuthor = () => {
    const authors = ["John Doe", "Jane Smith", "Alex Johnson", "Chris Lee"];
    const randomIndex = Math.floor(Math.random() * authors.length);
    return authors[randomIndex];
};

// Функция для открытия модального окна выбора доски
const openBoardSelectionModal = (image, author, avatar) => {
    const boardSelectionModal = document.getElementById('board-selection-modal');
    const boardSelectionList = document.getElementById('board-selection-list');

    boardSelectionList.innerHTML = '';

    for (const boardName in boards) {
        const listItem = document.createElement('li');
        listItem.textContent = boardName;
        listItem.onclick = function () {
            addToBoard(boardName, image, author, avatar);
            boardSelectionModal.style.display = 'none';
        };
        boardSelectionList.appendChild(listItem);
    }

    const closeButton = boardSelectionModal.querySelector('.close');
    closeButton.onclick = function () {
        boardSelectionModal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === boardSelectionModal) {
            boardSelectionModal.style.display = 'none';
        }
    };

    boardSelectionModal.style.display = 'block';
};

// Функция для добавления изображения в доску
const addToBoard = (boardName, image, author, avatar) => {
    if (!boards[boardName]) {
        boards[boardName] = [];
    }
    boards[boardName].push({ image, author, avatar });
    saveBoardsToLocalStorage();
};

// Функция для сохранения досок в локальное хранилище
const saveBoardsToLocalStorage = () => {
    localStorage.setItem('boards', JSON.stringify(boards));
};

// Функция для загрузки досок из локального хранилища
const loadBoardsFromLocalStorage = () => {
    const savedBoards = localStorage.getItem('boards');
    if (savedBoards) {
        boards = JSON.parse(savedBoards);
    }
};

// Функция для открытия модального окна досок
const openBoardsModal = () => {
    const boardModal = document.getElementById('board-modal');
    const boardList = document.getElementById('board-list');

    boardList.innerHTML = '';

    for (const boardName in boards) {
        const listItem = document.createElement('li');
        listItem.textContent = boardName;
        boardList.appendChild(listItem);
    }

    const closeButton = boardModal.querySelector('.close');
    closeButton.onclick = function () {
        boardModal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === boardModal) {
            boardModal.style.display = 'none';
        }
    };

    boardModal.style.display = 'block';
};



// Функция для удаления всех досок
const deleteAllBoards = () => {
    boards = {};
    saveBoardsToLocalStorage();
    openBoardsModal();
};

// Событие для создания новой доски
document.getElementById('boards-button').onclick = function () {
    const boardName = prompt('Введите название новой доски:');
    if (boardName) {
        boards[boardName] = [];
        saveBoardsToLocalStorage();
        openBoardsModal();
    }
};

// Событие для открытия модального окна досок
document.getElementById('view-boards-button').onclick = openBoardsModal;

// Событие для удаления всех досок
document.getElementById('delete-boards-button').onclick = deleteAllBoards;

// Загрузка досок из локального хранилища при загрузке страницы
loadBoardsFromLocalStorage();

// Загрузка и создание карточек при загрузке страницы
fetchAndCreateCards();


// Функция для обновления списка досок
const updateBoardsWindow = () => {
    const boardList = document.getElementById('board-list');
    boardList.innerHTML = ''; // Очищаем предыдущее содержимое

    for (const boardName in boards) {
        const listItem = document.createElement('li');
        const counter = document.createElement('span'); // Создаем элемент для счетчика
        counter.textContent = ` (${boards[boardName].length})`; // Устанавливаем количество карточек
        listItem.textContent = boardName;
        listItem.appendChild(counter); // Добавляем счетчик к названию доски
        listItem.addEventListener('click', () => {
            openBoardSelectionModal(boardName);
        });
        boardList.appendChild(listItem);
    }
};



