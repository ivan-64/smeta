// --- Глобальные переменные состояния ---
let rows = [];
let caption = "Сметная стоимость";
let docList = [];

// --- Константы для localStorage ---
const STORAGE_KEY = "costCalculatorTableData";
const CAPTION_KEY = "costCalculatorCaption";
const DOC_LIST_KEY = "costCalculatorDocList";

// --- Ссылки на DOM-элементы ---
const tableBody = document.getElementById("tableBody");
const totalCostElement = document.getElementById("totalCost");
const captionElement = document.getElementById("caption");
const burgerBtn = document.getElementById("burgerBtn");
const navMenu = document.getElementById("navMenu");
const addRowBtn = document.getElementById("addRowBtn");
const createNewDocBtn = document.getElementById("createNewDocBtn");
const saveDocBtn = document.getElementById("saveDocBtn");
const openDocSelect = document.getElementById("openDocSelect");
const deleteSelectedDocBtn = document.getElementById("deleteSelectedDocBtn");
const savePdfBtn = document.getElementById("savePdfBtn");
const mainContent = document.getElementById("mainContent");

// --- Функции для работы с Local Storage ---

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    localStorage.setItem(CAPTION_KEY, caption);
    localStorage.setItem(DOC_LIST_KEY, JSON.stringify(docList));
  } catch (e) {
    console.error("Ошибка сохранения в localStorage:", e);
    alert("Не удалось сохранить данные. Возможно, хранилище переполнено.");
  }
}

function loadFromLocalStorage() {
  try {
    const savedCaption = localStorage.getItem(CAPTION_KEY);
    if (savedCaption !== null) {
      caption = savedCaption;
      captionElement.textContent = caption;
    }

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (data && Array.isArray(data)) {
      rows = data.map((row, index) => ({
        ...row,
        id: index + 1,
        // Убедимся, что quantity и price всегда числа или пустые строки
        quantity:
          typeof row.quantity === "number"
            ? row.quantity
            : parseFloat(String(row.quantity)) || "",
        price:
          typeof row.price === "number"
            ? row.price
            : parseFloat(String(row.price)) || "",
        cost: parseFloat(String(row.cost)) || 0,
      }));
    } else {
      // Начальное состояние, если данных нет
      rows = [
        {
          id: 1,
          name: "Грунтовка пола",
          unit: "м2",
          quantity: 20,
          price: 100,
          cost: 2000,
          notes: "",
        },
        {
          id: 2,
          name: "Покраска стен",
          unit: "м2",
          quantity: 50,
          price: 150,
          cost: 7500,
          notes: "",
        },
        {
          id: 3,
          name: "Установка плинтусов",
          unit: "м.п.",
          quantity: 30,
          price: 50,
          cost: 1500,
          notes: "",
        },
        {
          id: 4,
          name: "",
          unit: "",
          quantity: "",
          price: "",
          cost: 0,
          notes: "",
        },
        {
          id: 5,
          name: "",
          unit: "",
          quantity: "",
          price: "",
          cost: 0,
          notes: "",
        },
      ];
    }

    const storedDocList = JSON.parse(
      localStorage.getItem(DOC_LIST_KEY) || "[]"
    );
    docList = storedDocList;
    renderDocList(); // Обновляем выпадающий список документов
  } catch (e) {
    console.error("Ошибка загрузки из localStorage:", e);
    alert("Не удалось загрузить данные. Возможно, данные повреждены.");
    // В случае ошибки загрузки, возвращаемся к начальному состоянию
    rows = [
      {
        id: 1,
        name: "Грунтовка пола",
        unit: "м2",
        quantity: 20,
        price: 100,
        cost: 2000,
        notes: "",
      },
      {
        id: 2,
        name: "Покраска стен",
        unit: "м2",
        quantity: 50,
        price: 150,
        cost: 7500,
        notes: "",
      },
      {
        id: 3,
        name: "Установка плинтусов",
        unit: "м.п.",
        quantity: 30,
        price: 50,
        cost: 1500,
        notes: "",
      },
      {
        id: 4,
        name: "",
        unit: "",
        quantity: "",
        price: "",
        cost: 0,
        notes: "",
      },
      {
        id: 5,
        name: "",
        unit: "",
        quantity: "",
        price: "",
        cost: 0,
        notes: "",
      },
    ];
    caption = "Сметная стоимость";
    captionElement.textContent = caption;
    docList = [];
    renderDocList();
  }
}

// --- НОВАЯ ФУНКЦИЯ: Динамическое изменение ширины поля ввода ---
function resizeInput(input) {
  if (!input) return;

  // Создаем временный span для измерения ширины текста
  const span = document.createElement("span");
  span.style.visibility = "hidden"; // Делаем его невидимым
  span.style.position = "absolute"; // Убираем его из потока документа
  span.style.whiteSpace = "nowrap"; // Важно: текст не должен переноситься на новую строку

  // Копируем стили шрифта из input в span для точного измерения
  const computedStyle = window.getComputedStyle(input);
  span.style.fontFamily = computedStyle.fontFamily;
  span.style.fontSize = computedStyle.fontSize;
  span.style.fontWeight = computedStyle.fontWeight;
  span.style.letterSpacing = computedStyle.letterSpacing;
  span.style.padding = computedStyle.padding; // Учитываем padding в измерении

  // Устанавливаем текст span равным значению input (или placeholder, если пусто)
  span.textContent = input.value || input.placeholder || "";

  document.body.appendChild(span); // Добавляем span в DOM для измерения

  // Вычисляем новую ширину, добавляя небольшой буфер для курсора и отступов
  const newWidth = span.offsetWidth + 8; // Добавляем 8px буфера

  document.body.removeChild(span); // Удаляем временный span

  // Применяем новую ширину к input
  input.style.width = `${newWidth}px`;

  // Устанавливаем минимальную ширину, чтобы поле не было слишком маленьким
  const minWidth = 50; // Минимальная ширина в пикселях
  if (newWidth < minWidth) {
    input.style.width = `${minWidth}px`;
  }
}

// --- Логика таблицы ---

function renderTable() {
  tableBody.innerHTML = ""; // Очищаем таблицу перед рендерингом
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                  <td>${row.id}</td>
                  <td contenteditable="true" data-field="name">${row.name}</td>
                  <td contenteditable="true" data-field="unit">${row.unit}</td>
                  <td class="volume"><input type="number" data-field="quantity" value="${
                    row.quantity
                  }" class="table-input" placeholder="0" /></td>
                  <td class="price"><input type="number" data-field="price" value="${
                    row.price
                  }" class="table-input" placeholder="0" /></td>
                  <td class="cost">${row.cost.toFixed(2)}</td>
                  <td contenteditable="true" data-field="notes">${linkify(
                    row.notes
                  )}</td>
                  <td class="delete-column-cell"><button class="delete-btn" data-id="${
                    row.id
                  }">x</button></td>
              `;
    tableBody.appendChild(tr);

    // НОВОЕ: Изменяем размер input полей сразу после их создания
    const quantityInput = tr.querySelector('input[data-field="quantity"]');
    const priceInput = tr.querySelector('input[data-field="price"]');
    resizeInput(quantityInput);
    resizeInput(priceInput);
  });
  calculateTotalSum();
  // Убрали saveToLocalStorage() отсюда, чтобы не сохранять при каждой перерисовке,
  // а только при реальных изменениях данных через обработчики событий.
}

// Эта функция теперь не используется напрямую, её логика встроена в обработчики событий
// function handleInputChange(id, field, value) {
//     const rowIndex = rows.findIndex(row => row.id === id);
//     if (rowIndex > -1) {
//         const updatedRow = { ...rows[rowIndex], [field]: value };

//         if (field === "quantity" || field === "price") {
//             const quantity = parseFloat(String(updatedRow.quantity)) || 0;
//             const price = parseFloat(String(updatedRow.price)) || 0;
//             updatedRow.cost = quantity * price;
//         }
//         rows[rowIndex] = updatedRow;
//         renderTable(); // Перерисовываем таблицу для обновления стоимости
//     }
// }

function addRow() {
  const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
  rows.push({
    id: newId,
    name: "",
    unit: "",
    quantity: "",
    price: "",
    cost: 0,
    notes: "",
  });
  // Переиндексируем все строки, чтобы ID были последовательными
  rows = rows.map((row, idx) => ({ ...row, id: idx + 1 }));
  renderTable();
  saveToLocalStorage(); // Сохраняем после добавления строки
}

function deleteRow(id) {
  if (!confirm("Вы уверены, что хотите удалить эту строку?")) {
    return;
  }
  rows = rows.filter((row) => row.id !== id);
  // Переиндексируем оставшиеся строки
  rows = rows.map((row, idx) => ({ ...row, id: idx + 1 }));
  renderTable();
  saveToLocalStorage(); // Сохраняем после удаления строки
}

function calculateTotalSum() {
  const totalSum = rows.reduce((sum, row) => sum + row.cost, 0);
  totalCostElement.textContent = totalSum.toFixed(2);
}

// --- Управление документами ---

function renderDocList() {
  openDocSelect.innerHTML = '<option value="">Выбор документа</option>'; // Очищаем и добавляем дефолтную опцию
  if (docList.length === 0) {
    const option = document.createElement("option");
    option.value = "no-docs";
    option.disabled = true;
    option.textContent = "Нет сохраненных документов";
    openDocSelect.appendChild(option);
  } else {
    docList.forEach((docName) => {
      const option = document.createElement("option");
      option.value = docName;
      option.textContent = docName;
      openDocSelect.appendChild(option);
    });
  }
}

function createNewDocument() {
  if (
    confirm(
      "Вы уверены, что хотите создать новый документ? Несохраненные изменения будут потеряны."
    )
  ) {
    rows = [
      {
        id: 1,
        name: "",
        unit: "",
        quantity: "",
        price: "",
        cost: 0,
        notes: "",
      },
    ];
    caption = "Новый документ";
    captionElement.textContent = caption;
    renderTable();
    saveToLocalStorage(); // Сохраняем после создания нового документа
  }
}

function saveDocument() {
  const docName = prompt("Введите имя для сохранения документа:", caption);
  if (!docName || docName.trim() === "") {
    alert("Имя документа не может быть пустым.");
    return;
  }

  const docData = {
    caption: caption,
    table: rows,
  };
  try {
    localStorage.setItem("doc_" + docName, JSON.stringify(docData));
    if (!docList.includes(docName)) {
      docList.push(docName);
      docList.sort();
      renderDocList();
    }
    alert(`Документ "${docName}" сохранён!`);
    saveToLocalStorage(); // Сохраняем обновленный список документов
  } catch (e) {
    console.error("Ошибка сохранения документа:", e);
    alert("Не удалось сохранить документ. Возможно, хранилище переполнено.");
  }
}

function openDocumentByName(docName) {
  if (!docName) return;

  try {
    const docData = JSON.parse(
      localStorage.getItem("doc_" + docName) || "null"
    );
    if (!docData) {
      alert("Ошибка загрузки документа. Документ не найден.");
      return;
    }

    caption = docData.caption;
    captionElement.textContent = caption;
    rows = docData.table.map((row, idx) => ({ ...row, id: idx + 1 }));
    renderTable();
    saveToLocalStorage(); // Сохраняем текущее состояние после открытия документа
    alert(`Документ "${docName}" открыт!`);
  } catch (e) {
    console.error("Ошибка открытия документа:", e);
    alert("Не удалось открыть документ. Возможно, данные повреждены.");
  }
}

function deleteSelectedDoc() {
  const docName = openDocSelect.value;
  if (!docName || docName === "no-docs") {
    alert("Пожалуйста, выберите документ для удаления.");
    return;
  }
  if (!confirm(`Вы уверены, что хотите удалить документ "${docName}"?`)) {
    return;
  }

  try {
    localStorage.removeItem("doc_" + docName);
    docList = docList.filter((name) => name !== docName);
    renderDocList();
    alert(`Документ "${docName}" удалён!`);
    saveToLocalStorage(); // Сохраняем обновленный список документов
  } catch (e) {
    console.error("Ошибка удаления документа:", e);
    alert("Не удалось удалить документ.");
  }
}

// --- Автоматическое создание ссылок в заметках ---
function linkify(text) {
  if (!text) return "";
  return text.replace(
    /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi,
    (url) => {
      let href = url;
      if (!href.match(/^https?:\/\//i)) href = "http://" + href;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  );
}

// --- Экспорт в PDF ---
async function savePdf() {
  const container = mainContent;
  if (!container) {
    alert("Не найден контейнер для экспорта в PDF");
    return;
  }

  // Временно скрываем колонку "Действия" и кнопки для экспорта в PDF
  const deleteColumnHeader = document.querySelector(
    "thead th.delete-column-header"
  );
  const deleteButtons = document.querySelectorAll(
    "tbody td.delete-column-cell"
  );

  if (deleteColumnHeader) deleteColumnHeader.style.display = "none";
  deleteButtons.forEach((el) => (el.style.display = "none"));

  // Опции для html2pdf
  const opt = {
    margin: 0.5,
    filename: (caption || "Документ") + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: true },
    jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
  };

  try {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Небольшая задержка
    await window.html2pdf().set(opt).from(container).save();
    console.log("PDF сохранен успешно!");
  } catch (error) {
    console.error("Ошибка при сохранении PDF:", error);
    alert(
      `Не удалось сохранить PDF. Пожалуйста, попробуйте еще раз. Возможно, проблема с цветами или стилями. Ошибка: ${
        error instanceof Error ? error.message : String(error)
      }\n\nРекомендуется использовать встроенную функцию печати браузера (Ctrl+P или Cmd+P).`
    );
  } finally {
    // Восстанавливаем видимость колонки "Действия" и кнопок после экспорта
    if (deleteColumnHeader) deleteColumnHeader.style.display = "table-cell";
    deleteButtons.forEach((el) => (el.style.display = "table-cell"));
  }
}

// --- Инициализация и обработчики событий ---
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  renderTable(); // Первичная отрисовка таблицы

  // Обработчик для бургер-меню
  burgerBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    burgerBtn.classList.toggle("active");
  });

  // Закрытие меню при клике вне его
  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(event.target) &&
      !burgerBtn.contains(event.target)
    ) {
      navMenu.classList.remove("open");
      burgerBtn.classList.remove("active");
    }
  });

  // НОВОЕ: Закрытие меню при клике на сам фон меню
  navMenu.addEventListener("click", (event) => {
    // Если клик был по самому элементу navMenu, а не по его дочерним элементам (кнопкам, select)
    if (event.target === navMenu) {
      navMenu.classList.remove("open");
      burgerBtn.classList.remove("active");
    }
  });

  // ЕДИНЫЙ ОБРАБОТЧИК для всех полей ввода (contenteditable и input)
  tableBody.addEventListener("input", (event) => {
    const target = event.target;
    const tr = target.closest("tr");
    if (!tr) return; // Защита от ошибок

    const rowId = parseInt(tr.querySelector("td:first-child").textContent);
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return; // Защита от ошибок

    const field = target.dataset.field;
    let value;

    if (target.tagName === "INPUT") {
      value = target.value; // Для <input> используем .value
      resizeInput(target); // НОВОЕ: Изменяем размер input поля при каждом вводе
    } else if (target.contentEditable === "true") {
      value = target.textContent; // Для contenteditable используем .textContent
    } else {
      return; // Если это не поле, которое мы отслеживаем, выходим
    }

    // Обновляем данные в массиве rows
    const updatedRow = { ...rows[rowIndex], [field]: value };

    // Пересчитываем стоимость, если изменились "Объём" или "Цена"
    if (field === "quantity" || field === "price") {
      const quantity = parseFloat(String(updatedRow.quantity)) || 0;
      const price = parseFloat(String(updatedRow.price)) || 0;
      updatedRow.cost = quantity * price;

      // Обновляем ячейку "Стоимость" в DOM напрямую
      tr.querySelector(".cost").textContent = updatedRow.cost.toFixed(2);
    }

    rows[rowIndex] = updatedRow; // Обновляем строку в глобальном массиве

    calculateTotalSum(); // Пересчитываем и обновляем общую сумму
    saveToLocalStorage(); // Сохраняем все данные после каждого изменения
  });

  // Обработчик blur для contenteditable полей (особенно для заметок, чтобы применить linkify)
  tableBody.addEventListener(
    "blur",
    (event) => {
      const target = event.target;
      if (target.contentEditable === "true" && target.dataset.field) {
        const tr = target.closest("tr");
        if (!tr) return;

        const rowId = parseInt(tr.querySelector("td:first-child").textContent);
        const rowIndex = rows.findIndex((row) => row.id === rowId);
        if (rowIndex === -1) return;

        const field = target.dataset.field;
        let value = target.textContent || "";

        // Применяем linkify только для поля "Заметки"
        if (field === "notes") {
          target.innerHTML = linkify(value);
        }
        // Для contenteditable полей, которые не являются quantity/price,
        // мы также сохраняем данные при потере фокуса, чтобы убедиться,
        // что финальное состояние сохранено (input может не всегда срабатывать на всех изменениях)
        rows[rowIndex] = { ...rows[rowIndex], [field]: value };
        saveToLocalStorage();
      }
    },
    true
  );

  // Обработчик для кликов по ссылкам в заметках
  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    const link = target.closest("a");
    if (link && link instanceof HTMLAnchorElement) {
      event.preventDefault(); // Предотвращаем стандартное поведение contentEditable
      window.open(link.href, "_blank"); // Открываем ссылку в новой вкладке
    }
  });

  // Обработчик для кнопки "Удалить"
  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("delete-btn")) {
      const rowId = parseInt(target.dataset.id);
      deleteRow(rowId);
    }
  });

  // Обработчик для изменения заголовка
  captionElement.addEventListener("input", (event) => {
    caption = event.target.textContent || "";
    saveToLocalStorage();
  });

  // Обработчики кнопок меню
  addRowBtn.addEventListener("click", addRow);
  createNewDocBtn.addEventListener("click", createNewDocument);
  saveDocBtn.addEventListener("click", saveDocument);
  openDocSelect.addEventListener("change", (event) =>
    openDocumentByName(event.target.value)
  );
  deleteSelectedDocBtn.addEventListener("click", deleteSelectedDoc);
  savePdfBtn.addEventListener("click", savePdf);
});

// Функция для применения linkify к заметкам при рендеринге
// Эта функция вызывается внутри renderTable, но для contenteditable
// нам нужно применять ее после редактирования.
// Для простоты, в чистом JS, мы будем применять ее при рендеринге
// и при потере фокуса, чтобы ссылки были кликабельны.
// Этот обработчик blur теперь дублирует логику из основного обработчика blur,
// но оставлен для ясности, если бы были специфичные для linkify действия.
// В текущей реализации его можно было бы удалить, так как основной blur его покрывает.
tableBody.addEventListener(
  "blur",
  (event) => {
    const target = event.target;
    if (target.contentEditable === "true" && target.dataset.field === "notes") {
      target.innerHTML = linkify(target.textContent || "");
    }
  },
  true
);
