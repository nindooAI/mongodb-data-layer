export interface PaginatedQueryResult<TEntity> {
  count: number
  total: number
  results: TEntity[]
}
