import nodemailer from "nodemailer"

export interface AlertConfig {
  email?: {
    host: string
    port: number
    user: string
    pass: string
    from: string
    to: string[]
    secure?: boolean
  }
  console?: boolean
  bufferSize?: number
}

export interface AlertSignal {
  title: string
  message: string
  level: "info" | "warning" | "critical"
  timestamp?: Date
  metadata?: Record<string, unknown>
}

export class AlertService {
  constructor(private cfg: AlertConfig) {}

  private async sendEmail(signal: AlertSignal) {
    if (!this.cfg.email) return
    const { host, port, user, pass, from, to, secure } = this.cfg.email
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure ?? false,
      auth: { user, pass },
    })
    await transporter.sendMail({
      from,
      to,
      subject: `[${signal.level.toUpperCase()}] ${signal.title}`,
      text: `${signal.message}\n\nTimestamp: ${signal.timestamp ?? new Date().toISOString()}`,
    })
  }

  private logConsole(signal: AlertSignal) {
    if (!this.cfg.console) return
    const time = signal.timestamp?.toISOString() ?? new Date().toISOString()
    console.log(
      `[Alert][${signal.level.toUpperCase()}][${time}] ${signal.title}\n${signal.message}`
    )
    if (signal.metadata) {
      console.log("Metadata:", JSON.stringify(signal.metadata, null, 2))
    }
  }

  async dispatch(signals: AlertSignal[]) {
    for (const sig of signals) {
      const enriched: AlertSignal = { ...sig, timestamp: sig.timestamp ?? new Date() }
      await this.sendEmail(enriched)
      this.logConsole(enriched)
    }
  }

  async notify(signal: AlertSignal) {
    return this.dispatch([signal])
  }
}
