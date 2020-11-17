import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface SunType {
  type: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.sumTypes({ type: 'income' });
    const outcome = await this.sumTypes({ type: 'outcome' });

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  private async sumTypes({ type }: SunType): Promise<number> {
    const transactions = getRepository(Transaction);
    const totalTypes = await transactions.find({ where: { type } });

    const totalOfType = totalTypes.reduce(
      (total, { value }) => total + Number(value),
      0,
    );

    return totalOfType;
  }
}

export default TransactionsRepository;
