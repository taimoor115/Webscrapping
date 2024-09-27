import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allBooks = [];
  const maxPages = 50;

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      const books = await page.evaluate(() => {
        const booksElement = document.querySelectorAll(".product_pod");
        return Array.from(booksElement).map((book) => {
          const title = book.querySelector("h3 a").getAttribute("title");
          const price = book.querySelector(".price_color").textContent;
          const stock = book.querySelector(".instock.availability")
            ? "In stock"
            : "Out of stock";
          const rating = book
            .querySelector(".star-rating")
            .className.split(" ")[1];
          const link = book.querySelector("h3 a").getAttribute("href");
          return {
            title,
            price,
            stock,
            rating,
            link,
          };
        });
      });

      allBooks.push(...books);
      console.log(`Books on page ${currentPage}`, books);
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
    }
  }

  fs.writeFileSync("books.json", JSON.stringify(allBooks, null, 2));
  console.log("Data saved to books.json");

  await browser.close();
};

scrape();
