const fs = require("fs");
const htmlPdf = require("html-pdf-node");
const Handlebars = require("handlebars");
const { CustomError } = require("../utils/index");

async function generatePdfData(pdfData) {
  try {
    console.log(pdfData.type, "pdfData");
    let templatePath = __dirname + "/currencyTemplate.html";

    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateHtml);

    Handlebars.registerHelper("incrementIndex", function (value) {
      return value + 1;
    });

    const htmlToConvert = template(pdfData);

    const options = {
      border: "10mm",
    };

    const pdfBuffer = await htmlPdf.generatePdf(
      { content: htmlToConvert },
      options
    );

    console.log(pdfBuffer, "pdfBuffer");
    if (pdfBuffer) {
      return {
        success: true,
        message: "PDF generated successfully!",
        data: pdfBuffer,
      };
    } else {
      return {
        success: false,
        message: "PDF generated failed!",
        data: {},
      };
    }
  } catch (error) {
    // Dependency link
    // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
    console.log(error);
    throw new CustomError(error, 400, {});
  }
}
module.exports = { generatePdfData };
