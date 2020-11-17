import { Router } from 'express';
import { getRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getRepository(Transaction);
  const transactions = await transactionsRepository.find();

  const getBalance = new TransactionsRepository();
  const balance = await getBalance.getBalance();

  const transaction = {
    transactions,
    balance,
  };

  return response.status(200).json(transaction);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  const transactionToReturn = {
    id: transaction.id,
    title: transaction.title,
    type: transaction.type,
    value: transaction.value,
    category,
  };

  return response.status(201).json(transactionToReturn);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionDelete = new DeleteTransactionService();

  await transactionDelete.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute({
      filaToImport: request.file.filename,
    });

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
