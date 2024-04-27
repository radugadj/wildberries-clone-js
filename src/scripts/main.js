'use strict';

// Переменные для управления загрузкой изображений
let page = 1; // Номер страницы для загрузки
let fetching = false; // Флаг для отслеживания состояния загрузки
let allImagesLoaded = false; // Флаг для отслеживания загрузки всех изображений
const container = document.getElementById('main'); // Контейнер для карточек изображений
const cols = Array.from(container.getElementsByClassName('col')); // Массив колонок для размещения карточек

// Функция для загрузки данных изображений
const fetchImageData = async () => {
    try {
        if (fetching || allImagesLoaded) return; // Если уже выполняется загрузка или все изображения загружены, выходим из функции
        fetching = true; // Устанавливаем флаг загрузки
        const loader = document.getElementById('loader'); // Получаем элемент индикатора загрузки
        loader.style.display = 'block'; // Показываем индикатор загрузки
        const response = await fetch(`https://dog.ceo/api/breeds/image/random/20`); // Запрос на сервер для получения данных изображений
        const data = await response.json(); // Преобразуем ответ в формат JSON
        fetching = false; // Сбрасываем флаг загрузки
        if (data.message.length === 0) {
            allImagesLoaded = true; // Если данные пусты, считаем что все изображения загружены
            loader.style.display = 'none'; // Скрываем индикатор загрузки
            return;
        }
        localStorage.setItem('dogImages', JSON.stringify(data.message)); // Сохраняем полученные данные в локальное хранилище
        loader.style.display = 'none'; // Скрываем индикатор загрузки
        return data.message; // Возвращаем массив данных изображений
    } catch (error) {
        console.error("Error fetching data:", error); // Выводим сообщение об ошибке в консоль
        fetching = false; // Сбрасываем флаг загрузки
        document.getElementById('loader').style.display = 'none'; // Скрываем индикатор загрузки
        throw error; // Выкидываем ошибку для обработки
    }
};

// Инициализация загрузки изображений при загрузке страницы
fetchImageData().then((images) => {
    if (images && images.length > 0) {
        images.forEach((image, index) => {
            createCard(image, cols[index % cols.length]); // Создаем карточку для каждого изображения и добавляем в колонку
        });
    }
}).catch((error) => {
    console.error("Error initial fetch:", error); // Выводим сообщение об ошибке в консоль
});

// Функция для загрузки случайного аватара
const fetchRandomAvatar = async () => {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random'); // Запрос на сервер для получения случайного аватара
        const data = await response.json(); // Преобразуем ответ в формат JSON
        return data.message; // Возвращаем URL полученного аватара
    } catch (error) {
        console.error("Error fetching random avatar:", error); // Выводим сообщение об ошибке в консоль
        throw error; // Выкидываем ошибку для обработки
    }
}

// Добавление класса "author" к элементу с именем автора в каждой карточке
const cards = document.querySelectorAll('.card'); // Получаем все карточки изображений
cards.forEach(card => {
    const authorElement = card.querySelector('p'); // Находим элемент с именем автора в каждой карточке
    authorElement.classList.add('author'); // Добавляем класс "author" к найденному элементу
});

// Обработчик события для строки поиска
const searchInput = document.getElementById('nav__search'); // Получаем элемент строки поиска
searchInput.addEventListener('input', function () {
    const searchText = this.value.trim().toLowerCase(); // Получаем текст из строки поиска и приводим его к нижнему регистру без лишних пробелов
    const cards = document.querySelectorAll('.card'); // Получаем все карточки изображений

    cards.forEach(card => {
        const authorElement = card.querySelector('.author'); // Получаем элемент с классом "author" в каждой карточке
        const authorName = authorElement.textContent.trim().toLowerCase(); // Получаем текст имени автора и приводим его к нижнему регистру без лишних пробелов

        // Проверяем, содержит ли текст имени автора введенный пользователем текст
        if (authorName.includes(searchText)) {
            card.style.display = 'block'; // Если содержит, показываем карточку
        } else {
            card.style.display = 'none'; // Если не содержит, скрываем карточку
        }
    });
});

// Функция для открытия модального окна с изображением
const openModal = (image, author, avatar, caption) => {
    const modal = document.createElement('div'); // Создаем элемент модального окна
    modal.classList.add('modal'); // Добавляем класс "modal" к элементу
    const modalContent = document.createElement('div'); // Создаем элемент содержимого модального окна
    modalContent.classList.add('modal-content'); // Добавляем класс "modal-content" к элементу
    const closeButton = document.createElement('span'); // Создаем кнопку закрытия модального окна
    closeButton.classList.add('close-button'); // Добавляем класс "close-button" к кнопке
    closeButton.innerHTML = '&times;'; // Устанавливаем текст кнопки
    closeButton.onclick = function () {
        modal.style.display = 'none'; // Закрываем модальное окно при клике на кнопку закрытия
    };
    const modalImgContainer = document.createElement('div'); // Создаем контейнер для изображения в модальном окне
    modalImgContainer.classList.add('modal-img-container'); // Добавляем класс "modal-img-container" к контейнеру
    const modalImg = document.createElement('img'); // Создаем элемент изображения
    modalImg.src = image; // Устанавливаем URL изображения
    modalImg.alt = "Random Dog Image"; // Устанавливаем альтернативный текст изображения
    modalImg.classList.add('modal-img'); // Добавляем класс "modal-img" к элементу изображения
    const modalInfo = document.createElement('div'); // Создаем контейнер для информации о изображении
    modalInfo.classList.add('modal-info'); // Добавляем класс "modal-info" к контейнеру
    const modalAvatar = document.createElement('img'); // Создаем элемент аватара
    modalAvatar.src = avatar; // Устанавливаем URL аватара
    modalAvatar.alt = "Author Avatar"; // Устанавливаем альтернативный текст аватара
    modalAvatar.classList.add('modal-avatar'); // Добавляем класс "modal-avatar" к элементу аватара
    const modalAuthor = document.createElement('p'); // Создаем элемент имени автора
    modalAuthor.textContent = author; // Устанавливаем текст имени автора
    modalAuthor.classList.add('modal-author'); // Добавляем класс "modal-author" к элементу имени автора
    modalContent.appendChild(closeButton); // Добавляем кнопку закрытия в содержимое модального окна
    modalImgContainer.appendChild(modalImg); // Добавляем изображение в контейнер для изображения
    modalContent.appendChild(modalImgContainer); // Добавляем контейнер для изображения в содержимое модального окна
    modalInfo.appendChild(modalAvatar); // Добавляем аватар в контейнер для информации
    modalInfo.appendChild(modalAuthor); // Добавляем имя автора в контейнер для информации
    modalContent.appendChild(modalInfo); // Добавляем контейнер для информации в содержимое модального окна
    modal.appendChild(modalContent); // Добавляем содержимое модального окна в модальное окно
    document.body.appendChild(modal); // Добавляем модальное окно в тело документа
    modal.style.display = 'block'; // Отображаем модальное окно
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Закрываем модальное окно при клике вне его области
        }
    };
};

// Функция для создания карточки с изображением
const createCard = async (image, col) => {
    const card = document.createElement('div'); // Создаем элемент карточки
    card.classList.add('card'); // Добавляем класс "card" к элементу
    const cardInfo = document.createElement('div'); // Создаем элемент информации о карточке
    cardInfo.classList.add('card__info'); // Добавляем класс "card__info" к элементу
    const cardImage = document.createElement('div'); // Создаем элемент изображения карточки
    cardImage.classList.add('card__image'); // Добавляем класс "card__image" к элементу
    const img = document.createElement('img'); // Создаем элемент изображения
    img.src = image; // Устанавливаем URL изображения
    img.alt = "Random Dog Image"; // Устанавливаем альтернативный текст изображения
    img.style.width = "100%"; // Устанавливаем ширину изображения
    img.onerror = function () {
        this.parentElement.style.display = "none"; // Скрываем изображение в случае ошибки загрузки
    };

    const cardAvatar = document.createElement('div'); // Создаем элемент аватара
    cardAvatar.classList.add('card__avatar'); // Добавляем класс "card__avatar" к элементу
    const avatarImg = document.createElement('img'); // Создаем элемент изображения аватара
    avatarImg.classList.add('avatar__img'); // Добавляем класс "avatar__img" к элементу
    avatarImg.alt = "Author Avatar"; // Устанавливаем альтернативный текст изображения аватара
    avatarImg.style.width = "20px"; // Устанавливаем ширину изображения аватара
    avatarImg.style.height = "20px"; // Устанавливаем высоту изображения аватара

    try {
        const randomAvatar = await fetchRandomAvatar(); // Загружаем случайный аватар
        avatarImg.src = randomAvatar; // Устанавливаем URL загруженного аватара
    } catch (error) {
        console.error("Error fetching random avatar:", error); // Выводим сообщение об ошибке в консоль
    }

    const authorName = generateRandomAuthor(); // Генерируем случайное имя автора
    const authorElement = document.createElement('p'); // Создаем элемент имени автора
    authorElement.classList.add('card__name'); // Добавляем класс "card__name" к элементу
    authorElement.textContent = authorName; // Устанавливаем текст элемента

    img.addEventListener('click', function () {
        openModal(image, authorName, avatarImg.src, ""); // Открываем модальное окно при клике на изображение
    });

    card.appendChild(cardImage); // Добавляем элемент изображения в карточку
    cardImage.appendChild(img); // Добавляем изображение в элемент изображения
    cardInfo.appendChild(cardAvatar); // Добавляем элемент аватара в информацию о карточке
    cardAvatar.appendChild(avatarImg); // Добавляем изображение аватара в элемент аватара
    cardInfo.appendChild(authorElement); // Добавляем элемент имени автора в информацию о карточке
    card.appendChild(cardInfo); // Добавляем информацию о карточке в карточку

    col.appendChild(card); // Добавляем карточку в колонку
};

// Функция для генерации случайного имени автора
const generateRandomAuthor = () => {
    const authors = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']; // Массив с именами авторов
    const randomIndex = Math.floor(Math.random() * authors.length); // Генерируем случайный индекс в массиве
    return authors[randomIndex]; // Возвращаем случайное имя автора
};

// Обработчик события прокрутки страницы
const handleScroll = () => {
    if (fetching || allImagesLoaded) return; // Если уже выполняется загрузка или все изображения загружены, выходим из функции

    const scrollTop = window.scrollY || document.documentElement.scrollTop; // Получаем текущую позицию скролла
    const windowHeight = window.innerHeight; // Получаем высоту видимой области окна
    const bodyHeight = document.documentElement.scrollHeight; // Получаем высоту всего документа

    if (bodyHeight - scrollTop - windowHeight < 50) { // Если прокрутка приближается к нижней границе страницы
        page++; // Увеличиваем номер страницы
        fetchImageData().then((images) => {
            if (images && images.length > 0) {
                images.forEach((image, index) => {
                    createCard(image, cols[index % cols.length]); // Создаем карточку для каждого изображения и добавляем в колонку
                });
            }
        }).catch((error) => {
            console.error("Error handling scroll:", error); // Выводим сообщение об ошибке в консоль
        });
    }
};

// Добавляем обработчик события прокрутки страницы
window.addEventListener('scroll', handleScroll);
