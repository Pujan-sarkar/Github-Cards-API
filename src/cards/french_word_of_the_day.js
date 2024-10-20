const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const { generateCard,  Languages } = require("../card-generator");
const { parseOptions } = require("../options-parser");

const CARD_AGE = 86400;
 
const DATA_FILE_PATH = "./src/data/french_word_of_the_day.json";
const DEFAULT_THEME = "light";

const handleTheme = (req, res, next) => {
  req.theme = req.query.theme || DEFAULT_THEME;
  next();
};

const handleOptions = (req, res, next) => {
  if (req.theme === "custom") {
    req.options = parseOptions(req.query);
  }
  next();
};

router.get("/", handleTheme, handleOptions, async (req, res) => {
  try {
    const FrenchwordOfTheDayData = JSON.parse(
      await fs.readFile(DATA_FILE_PATH, "utf8")
    );
    const randomWord =
      FrenchwordOfTheDayData[Math.floor(Math.random() * FrenchwordOfTheDayData.length)];
    const FrenchwordContent = `${randomWord.french}\n\nMeaning: ${randomWord.english}`;

    const FrenchwordCard = await generateCard(
      FrenchwordContent,
      req.theme,
      req.options,
      Languages.ENGLISH
    );

    res.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${CARD_AGE}`,
    });
    res.end(FrenchwordCard);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
