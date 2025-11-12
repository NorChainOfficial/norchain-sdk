import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerAccount } from './entities/ledger-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalLine } from './entities/journal-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import { Reconciliation } from './entities/reconciliation.entity';
import { ReconciliationMatch } from './entities/reconciliation-match.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LedgerAccount,
      JournalEntry,
      JournalLine,
      PeriodClosure,
      Reconciliation,
      ReconciliationMatch,
    ]),
    EventEmitterModule,
  ],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
