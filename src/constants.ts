export const rxMdBoldRef = new RegExp(`(?<=\\*\\*)(\\S.*?)(?=\\*\\*)`, `g`)

export const rxOrgBoldRef = new RegExp(`(?<=\\*)(\\S.*?)(?=\\*)`, `g`)

export const rxMdHighlightRef = new RegExp(`(?<=\\=\\=)(\\S.*?)(?=\\=\\=)`, `g`)

export const rxOrgHighlightRef = new RegExp(
  `(?<=\\^\\^)(\\S.*?)(?=\\^\\^)`,
  `g`,
)
