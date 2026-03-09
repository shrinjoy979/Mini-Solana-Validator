const express = require("express")
const bodyParser = require("body-parser")
const handleRPC = require("./rpc")

const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

app.post("/", async (req, res) => {
  const { id, method, params } = req.body

  try {
    const result = await handleRPC(method, params || [])

    res.json({
      jsonrpc: "2.0",
      id,
      result
    })

  } catch (err) {

    res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: err.code || -32603,
        message: err.message || "Internal error"
      }
    })
  }
})

app.listen(3000, () => {
  console.log("Mini Solana Validator running on port 3000")
})