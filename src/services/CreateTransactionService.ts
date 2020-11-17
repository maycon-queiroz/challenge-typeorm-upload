/* eslint-disable camelcase */
import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const balance = new TransactionsRepository();

    const totalInCash = await balance.getBalance();

    const { total } = totalInCash;

    if (total < value && type === 'outcome') {
      throw new AppError(
        'To do one transaction value cannot be less than zero',
        400,
      );
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(newCategory);

      const addNewTransaction = {
        title,
        type,
        value,
        category_id: newCategory.id,
      };

      const newTransaction = transactionRepository.create(addNewTransaction);

      await transactionRepository.save(newTransaction);

      // const transactionSaved = {
      //   id: newTransaction.id,
      //   title: newTransaction.title,
      //   type: newTransaction.type,
      //   value: newTransaction.value,
      //   category: newCategory,
      // };

      return newTransaction;
    }

    const addNewTransaction = {
      title,
      type,
      value,
      category_id: categoryExists.id,
    };

    const newTransaction = transactionRepository.create(addNewTransaction);
    await transactionRepository.save(newTransaction);

    // const transactionSaved = {
    //   id: newTransaction.id,
    //   title: newTransaction.title,
    //   type: newTransaction.type,
    //   value: newTransaction.value,
    //   category: categoryExists,
    // };

    return newTransaction;
  }
}

export default CreateTransactionService;
