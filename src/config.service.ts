import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { Injectable } from '@nestjs/common'

export interface IEnvConfig {
  [key: string]: string
}

@Injectable()
export class ConfigService {
  public readonly env: IEnvConfig

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath))
    this.env = config
    this.overwriteProcessEnv()
  }

  private overwriteProcessEnv() {
    Object.keys(this.env).forEach(k => {
      process.env[k] = this.env[k]
    })
  }
}
