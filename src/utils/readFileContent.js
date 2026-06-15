const fs = require("fs")
const XLSX = require("xlsx")

const readFileContent = (
  filePath
) => {
  const extension =
    filePath
      .split(".")
      .pop()
      ?.toLowerCase()

  // Excel files
  if (
    extension === "xlsx" ||
    extension === "xls"
  ) {
    const workbook =
      XLSX.readFile(filePath)

    const firstSheet =
      workbook.SheetNames[0]

    const sheet =
      workbook.Sheets[
        firstSheet
      ]

    const data =
      XLSX.utils.sheet_to_json(
        sheet
      )

    return JSON.stringify(
      data,
      null,
      2
    )
  }

  // CSV
  if (extension === "csv") {
    return fs.readFileSync(
      filePath,
      "utf8"
    )
  }

  // Text files
  return fs.readFileSync(
    filePath,
    "utf8"
  )
}

module.exports =
  readFileContent