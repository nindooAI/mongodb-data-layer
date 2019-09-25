export interface PaginatedQueryResult<TEntity> {
  count: number
  total: number
  range: {
    from: number
    to: number
  }
  results: TEntity[]
}
