import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { concatMap, defer, iif, map, Observable, of, tap } from 'rxjs';
import { Environment } from '../environment/environment.service';
import { Email } from './email';

@Injectable()
export class EmailService {
  private readonly _transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly _logger = new Logger(EmailService.name);
  private _verified = false;

  constructor(private readonly _env: Environment) {
    this._transporter = nodemailer.createTransport({
      host: _env.email.host,
      port: _env.email.port,
      secure: _env.email.port === 465,
      auth: {
        user: _env.email.user,
        pass: _env.email.password,
      },
    });
  }

  enviar(email: Email): Observable<Email> {
    return defer(() => {
      const verificar$ = defer(() => this._transporter.verify()).pipe(
        tap(() => (this._verified = true)),
      );
      const jaVerificado$ = of(email);
      return iif(() => this._verified, jaVerificado$, verificar$);
    }).pipe(
      concatMap(() => {
        const attachments =
          email.anexos && email.anexos.length > 0
            ? email.anexos.map((a) => ({
                filename: a.nome,
                content: a.base64,
                encoding: 'base64',
                cid: a.cid,
              }))
            : [];

        const options = {
          from: this._env.email.from,
          to: email.endereco,
          subject: email.assunto,
          html: email.texto,
          attachments,
        };
        return this._transporter.sendMail(options);
      }),
      map(() => email),
    );
  }
}
