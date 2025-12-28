export class JwtContent {
  uid: number;
  timestamp: number;

  constructor(uid: number, timestamp: number) {
    this.uid = uid;
    this.timestamp = timestamp;
  }
}
