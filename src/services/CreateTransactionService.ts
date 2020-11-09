import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type for transaction', 400);
    }

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not enought founds', 400);
    }

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type for transaction', 400);
    }

    const categoriesRepository = getRepository(Category);

    let categoryItem = await categoriesRepository.findOne({
      where: { title: category },
    });

    // let category_id;
    if (!categoryItem) {
      const newCategory = categoriesRepository.create({ title: category });
      categoryItem = await categoriesRepository.save(newCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryItem,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
