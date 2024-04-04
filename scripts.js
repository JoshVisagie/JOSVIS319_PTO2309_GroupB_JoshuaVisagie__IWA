//imports data.js
import { authors, books, genres, BOOKS_PER_PAGE } from "./data.js";

/**
 * global variables
 */
const FRAGMENT = document.createDocumentFragment();
let numOfBooksOnPage = BOOKS_PER_PAGE;
/**an array that will show all the books to display taking the filters into account */
let booksToDisplay = [];
/**an array that will will be all of the books currently being displayed on screen*/
let renderedBooks = [];
/**filter variables*/
let titleFilter = null;
let genreFilter = null;
let authorFilter = null;

/**
 * this is a list of Colors for CSS. They will be accessed when we change the
 * color mode of the website
 */
const CSS_COLORS = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },

  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
};

/**
 * a list of query selectors from index.html
 */
const HTML = {
  header: {
    search: document.querySelector("[data-header-search]"),
    settings: document.querySelector("[data-header-settings]"),
  },
  list: {
    items: document.querySelector("[data-list-items]"),
    message: document.querySelector("[data-list-message]"),
    button: document.querySelector("[data-list-button]"),
  },

  activeList: {
    overlay: document.querySelector("[data-list-active]"),
    preview: document.querySelector("[data-list-blur]"),
    content: document.querySelector(".overlay_content"),
    title: document.querySelector("[data-list-title]"),
    subtitle: document.querySelector("[data-list-subtitle]"),
    description: document.querySelector("[data-list-description]"),
    button: document.querySelector("[data-list-close]"),
  },

  search: {
    overlay: document.querySelector("[data-search-overlay]"),
    title: document.querySelector("[data-search-title]"),
    genre: document.querySelector("[data-search-genres]"),
    author: document.querySelector("[data-search-authors]"),
    cancelButton: document.querySelector("[data-search-cancel]"),
  },

  settings: {
    overlay: document.querySelector("[data-settings-overlay]"),
    theme: document.querySelector("[data-settings-theme]"),
    cancelButton: document.querySelector("[data-settings-cancel]"),
    submitButton: document.querySelector(".overlay__button_primary"),
  },
};

/**
 * this updates the list of books that will be displayed based on any filters that have been applied
 *
 */
const filterBooks = () => {
  booksToDisplay = [];

  for (const singleBook of books) {
    const hasMatchingGenre = singleBook.genres.some(
      (genre) => genre === genreFilter
    );
    const containsTitleFilter = singleBook.title
      .toLowerCase()
      .includes(titleFilter?.toLowerCase().trim());

    const hasGenreSelection = genreFilter === null || hasMatchingGenre;
    const hasTitleSelection = titleFilter === null || containsTitleFilter;
    const hasAuthorSelection =
      authorFilter === null || singleBook.author === authorFilter;

    if (hasGenreSelection && hasTitleSelection && hasAuthorSelection) {
      booksToDisplay.push(singleBook);
    }
  }
};
/** a function that creates the list of books that will be displayed on the page */
const paginateBooks = () => {
  renderedBooks = booksToDisplay.slice(0, numOfBooksOnPage);
};

/**
 * a function to update the 'Show More:' button
 */
const updateButton = () => {
  let { button } = HTML.list;

  let buttonValue = booksToDisplay.length - numOfBooksOnPage;
  button.className = "list__button";

  if (buttonValue <= 0) {
    buttonValue = 0;
    button.disabled = true;
  } else {
    button.disabled = false;
  }

  button.innerHTML = `
        <span>Show More:</span>
      <span class="list__remaining">(${buttonValue})</span>
      `;
};

/**
 * this function increases the books per page by 36 when the loadmore button event is called
 */
const handleLoadMore = () => {
  const nextBooks = booksToDisplay.slice(
    numOfBooksOnPage,
    numOfBooksOnPage + 36
  );
  numOfBooksOnPage = numOfBooksOnPage + 36;

  addFragment(nextBooks);
  updateButton();
};

/**
 * this takes an object called book and creates element with the html for a single
 * book.
 * @param {object} book
 * @returns element
 */
const createPreview = (book) => {
  const { title, image, author: authorID, id } = book;
  const newElement = document.createElement("div");
  const author = authors[authorID];

  newElement.dataset.id = id;
  newElement.className = "preview";
  newElement.innerHTML = `
        <img src= ${image} class ="preview__image"alt="${title}'s bookcover">
        <div class="list__items">       
          <div class='preview__title'>${title}</div>
          <div class="preview__author">${author}</div> 
        </div>                    
        `;
  return newElement;
};

/**
 * this factory function takes a selector from the html as an element
 * and a object to populate that selector. It also creates the first element with the text 'any' and value =null
 * @param {Element} element
 * @param {Object} object
 */
const populateSelect = (element, object) => {
  const emptyOption = document.createElement("option");
  emptyOption.value = null;
  emptyOption.text = `Any`;
  element.appendChild(emptyOption);

  for (const key in object) {
    const name = object[key];
    const newOption = document.createElement("option");
    newOption.value = key;
    newOption.textContent = name;
    element.appendChild(newOption);
  }
};

/**
 * this loop goes through all of the books that have been extracted and  uses
 * the factory function create preview to  in the items div
 */
const addFragment = (booksToRender) => {
  let { items } = HTML.list;

  for (const book of booksToRender) {
    FRAGMENT.append(createPreview(book));
  }
  items.appendChild(FRAGMENT);
};

/**
 *  This event toggles the search overlay when the search or cancel buttons
 */
const toggleSearchOverlay = () => {
  let { overlay, title } = HTML.search;

  if (!overlay.open) {
    overlay.open = true;
    title.focus();
  } else {
    overlay.open = false;
  }
};

/**
 * This function activates when someone someone submits the search form
 * It takes updates all the filters from the forms title, genre and author
 * it clears the items div and assigns the updated booksToDisplay[] to create
 * a new selection of books
 *
 * if there are no books within the search range it shows shows the message
 *
 * @param {event} event
 */
const applySearchFilters = (event) => {
  let { title, genre, author, overlay } = HTML.search;
  let { message, items } = HTML.list;
  event.preventDefault();
  items.innerHTML = "";

  titleFilter = title.value;
  genreFilter = genre.value;
  authorFilter = author.value;

  if (genreFilter === "null") genreFilter = null;
  if (authorFilter === "null") authorFilter = null;

  overlay.open = false;
  filterBooks();
  paginateBooks();
  addFragment(renderedBooks);
  updateButton();

  //displays notification that search filters are too narrow to find a book
  if (booksToDisplay.length === 0) {
    message.classList.add("list__message_show");
  } else {
    message.classList.remove("list__message_show");
  }
};

const toggleSelectedBook = (event) => {
  let {
    overlay,
    preview: bookPreview,
    title,
    subtitle,
    description,
  } = HTML.activeList;

  const selectedBookElement = event.target.closest(".preview");
  if (selectedBookElement) {
    const bookIdOfSelectedBookElement = selectedBookElement.dataset.id;
    const selectedBook = books.find(
      (book) => book.id === bookIdOfSelectedBookElement
    );
    if (selectedBook) {
      title.textContent = `${
        selectedBook.title
      } (${selectedBook.published.slice(0, 4)})`;
      //TODO:add date function
      subtitle.textContent = authors[selectedBook.author];
      description.textContent = selectedBook.description;
      //TODO:Add styling to CSS
      description.style = "overflow-y:scroll";
      bookPreview.src = selectedBook.image;

      overlay.open = true;

      const imageElement = selectedBookElement
        .querySelector("img")
        .cloneNode(true);

      overlay.insertBefore(imageElement, bookPreview.parentElement);
      imageElement.classList.add("overlay__image");
      imageElement.classList.remove("preview__image");
    }
  }
};
/**
 * this closes the overlay of book you have selected
 * @param {event} event
 */
const closeSelectedBookOverlay = (event) => {
  let { overlay } = HTML.activeList;
  overlay.open = false;
};
/**
 * this toggles the settings overlay open and closed when pushing the settings
 * button on the header or the cancel button on the form
 * @param {event} event
 */
const toggleSettingsOverlay = (event) => {
  let { overlay, theme } = HTML.settings;
  if (!overlay.open) {
    overlay.open = true;
    theme.focus();
  } else {
    overlay.open = false;
  }
};

/**
 * this functions changes the look color mode of the website when the submit
 * form is submitted
 * @param {event} event
 */
const updateThemeColor = (event) => {
  event.preventDefault();

  let { theme, overlay } = HTML.settings;
  const colorMode = theme.value;
  setThemeColorProperties(colorMode);
  overlay.open = false;
};
/**
 * this function sets the color mode based on the value ('day'||'night') provided
 * @param {string} targetColorMode
 */
const setThemeColorProperties = (targetColorMode) => {
  document.documentElement.style.setProperty(
    "--color-dark",
    CSS_COLORS[targetColorMode].dark
  );
  document.documentElement.style.setProperty(
    "--color-light",
    CSS_COLORS[targetColorMode].light
  );
};
/**
 * this function automatically sets the theme selector to match the users prefered
 * theme based on their browser preferences
 */
const setColorThemeSelector = () => {
  HTML.settings.theme.value =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "night"
      : "day";
};

HTML.list.button.addEventListener("click", handleLoadMore);
HTML.header.search.addEventListener("click", toggleSearchOverlay);
HTML.search.overlay.addEventListener("submit", applySearchFilters);
HTML.search.cancelButton.addEventListener("click", toggleSearchOverlay);
HTML.list.items.addEventListener("click", toggleSelectedBook);
HTML.activeList.button.addEventListener("click", closeSelectedBookOverlay);
HTML.settings.overlay.addEventListener("submit", updateThemeColor);
HTML.header.settings.addEventListener("click", toggleSettingsOverlay);
HTML.settings.cancelButton.addEventListener("click", toggleSettingsOverlay);

/**
 * functions called
 */
filterBooks();
paginateBooks();
updateButton();
populateSelect(HTML.search.genre, genres);
populateSelect(HTML.search.author, authors);
addFragment(renderedBooks);
setColorThemeSelector();

//if(!books && !Array.isArray(books)) throw new Error('Source required')
//if(!range && range.length < 2) throw new Error('Range must be an array with two numbers')

// v = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches? 'night' | 'day'
