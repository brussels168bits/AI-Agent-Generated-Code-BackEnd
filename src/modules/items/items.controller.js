import * as service from './items.service.js';

export async function list(req, res, next) {
  try {
    const result = await service.list(req.query, req.user);
    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      message: null,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const result = await service.findById(req.params.itemId, req.user);
    const code = result ? 'SUCCESS' : 'DATA_NOT_FOUND';
    return res.status(200).json({
      success: true,
      code,
      message: null,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const result = await service.create(req.body, req.user);
    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      message: null,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function replace(req, res, next) {
  try {
    const result = await service.replace(req.params.itemId, req.body, req.user);
    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      message: null,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function patch(req, res, next) {
  try {
    const result = await service.patch(req.params.itemId, req.body, req.user);
    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      message: null,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.softDelete(req.params.itemId, req.body.upd_date, req.user);
    return res.status(200).json({
      success: true,
      code: 'SUCCESS',
      message: null,
      data: null,
    });
  } catch (err) {
    next(err);
  }
}
