import cvsParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';
import UploadConfig from '../config/upload';

interface Request {
  filaToImport: string;
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ filaToImport }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    let transactionImported: TransactionDTO[] = [];
    transactionImported = await this.transformFileInArray(filaToImport);

    const transactionCreated: Transaction[] = [];

    for (const transaction of transactionImported) {
      const transactionSaved = await createTransaction.execute(transaction);
      transactionCreated.push(transactionSaved);
    }

    return transactionCreated;
  }

  private async transformFileInArray(
    fileExits: string,
  ): Promise<Array<TransactionDTO>> {
    const pathFileToImport = path.resolve(UploadConfig.directory, fileExits);
    const fileExited = await fs.promises.stat(pathFileToImport);

    if (!fileExited) {
      throw new AppError(
        'This file selected to import is not exists, please check it',
        401,
      );
    }
    const readCSVStream = fs.createReadStream(pathFileToImport);

    const parseStream = cvsParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    fs.unlink(pathFileToImport, error => {
      if (error) throw error;
      // eslint-disable-next-line no-console
      console.log(`${fileExits} was deleted.`);
    });

    const rows: Array<TransactionDTO> = [];

    parseCSV.on('data', row => {
      const [title, type, value, category] = row;
      rows.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return rows;
  }
}

export default ImportTransactionsService;
