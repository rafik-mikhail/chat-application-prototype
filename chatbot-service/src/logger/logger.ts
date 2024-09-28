import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
  error(...items: [any, string?, string?]) {
    // custom error logging logic should go here
    super.error(...items);
  }
}
