(async () => {
  // 1) Analyze activity
  const activityAnalyzer = new TokenActivityAnalyzer("https://solana.rpc")
  const records = await activityAnalyzer.analyzeActivity("MintPubkeyHere", 20)

  // 2) Analyze depth
  const depthAnalyzer = new TokenDepthAnalyzer("https://dex.api", "MarketPubkeyHere")
  const depthMetrics = await depthAnalyzer.analyze(30)

  // 3) Detect patterns
  const volumes = records.map(r => r.amount)
  const patterns = detectVolumePatterns(volumes, 5, 100)

  // 4) Execute custom tasks
  const engine = new ExecutionEngine()
  engine.register("report", async params => ({
    records: params.records.length,
    totalVolume: params.records.reduce((sum: number, r: any) => sum + r.amount, 0),
  }))
  engine.register("summary", async params => ({
    min: Math.min(...params.values),
    max: Math.max(...params.values),
    average: params.values.reduce((a: number, b: number) => a + b, 0) / params.values.length,
  }))

  engine.enqueue("task1", "report", { records })
  engine.enqueue("task2", "summary", { values: volumes })
  const taskResults = await engine.runAll()

  // 5) Sign the results
  const signer = new SigningEngine()
  const payload = JSON.stringify({ depthMetrics, patterns, taskResults })
  const signature = await signer.sign(payload)
  const ok = await signer.verify(payload, signature)

  // 6) Final consolidated result
  const result = {
    records,
    depthMetrics,
    patterns,
    taskResults,
    signatureValid: ok,
    timestamp: new Date().toISOString(),
  }

  console.log(result)
})()
