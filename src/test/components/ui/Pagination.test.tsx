import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../../../components/ui/Pagination'

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('disables Previous on the first page and moves forward', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />)

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Next on the last page', () => {
    render(<Pagination page={3} pageCount={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
  })
})
