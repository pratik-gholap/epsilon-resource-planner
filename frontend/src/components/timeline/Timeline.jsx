import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import TimelineGrid from './TimelineGrid';
import { getPeriodDates } from '../../utils/dates';

export default function Timeline({ onAddAssignment, onEditAssignment }) {
  const { 
    currentPeriodOffset, 
    setCurrentPeriodOffset,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    people 
  } = useApp();
  
  const changePeriod = (offset) => {
    setCurrentPeriodOffset(currentPeriodOffset + offset);
  };
  
  const jumpToCurrentMonth = () => {
    // Calculate offset from Jan 2026 to current month
    const now = new Date();
    const startDate = new Date(2026, 0, 1); // Jan 1, 2026
    const yearsDiff = now.getFullYear() - startDate.getFullYear();
    const monthsDiff = now.getMonth() - startDate.getMonth();
    const totalMonthsOffset = (yearsDiff * 12) + monthsDiff;
    setCurrentPeriodOffset(totalMonthsOffset);
  };
  
  const getDisplayRange = () => {
    // Get first and last month in the 6-month view
    const firstMonth = getPeriodDates(currentPeriodOffset);
    const lastMonth = getPeriodDates(currentPeriodOffset + 5);
    
    // Format as "Jan 26 - Jun 26"
    const [firstMonthName, firstYear] = firstMonth.label.split(' ');
    const [lastMonthName, lastYear] = lastMonth.label.split(' ');
    const shortFirstYear = firstYear.slice(-2);
    const shortLastYear = lastYear.slice(-2);
    
    return `${firstMonthName} ${shortFirstYear} - ${lastMonthName} ${shortLastYear}`;
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            changePeriod(-6);
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            changePeriod(6);
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            changePage(-1);
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            changePage(1);
          }
          break;
        case 'Home':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            jumpToCurrentMonth();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPeriodOffset, currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Pagination
  const totalPeople = people.length;
  const showAll = pageSize === 'all';
  const itemsPerPage = showAll ? totalPeople : parseInt(pageSize);
  const totalPages = showAll ? 1 : Math.ceil(totalPeople / itemsPerPage);
  const startIndex = showAll ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = showAll ? totalPeople : Math.min(startIndex + itemsPerPage, totalPeople);
  
  const changePage = (delta) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const changePageSize = (e) => {
    setPageSize(e.target.value);
    setCurrentPage(1);
  };
  
  const paginationInfo = totalPeople === 0
    ? 'No people to display'
    : showAll
    ? `Showing all ${totalPeople} people`
    : `Showing ${startIndex + 1}-${endIndex} of ${totalPeople} people (Page ${currentPage} of ${totalPages})`;

  return (
    <div className="timeline-shell">
      {/* Header */}
      <div className="timeline-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '1rem',
            fontWeight: 600
          }}>
            Timeline View
          </div>
          <button 
            className="btn-icon"
            onClick={jumpToCurrentMonth}
            style={{ width: '32px', height: '32px' }}
            title="Jump to Current Month"
          >
            <span style={{ fontSize: '1.2rem' }}>📅</span>
          </button>
          
          {/* Top Pagination Info */}
          <div style={{ 
            fontSize: '0.8125rem', 
            color: 'var(--text-secondary)',
            marginLeft: '0.5rem'
          }}>
            {paginationInfo}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Top Pagination Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className="btn"
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1 || showAll}
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.8125rem',
                minWidth: 'auto'
              }}
            >
              ← Prev
            </button>
            <select 
              value={pageSize}
              onChange={changePageSize}
              style={{
                padding: '0.4rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem'
              }}
            >
              <option value="5">5/page</option>
              <option value="8">8/page</option>
              <option value="10">10/page</option>
              <option value="20">20/page</option>
              <option value="50">50/page</option>
              <option value="all">All</option>
            </select>
            <button 
              className="btn"
              onClick={() => changePage(1)}
              disabled={currentPage >= totalPages || showAll}
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.8125rem',
                minWidth: 'auto'
              }}
            >
              Next →
            </button>
          </div>
          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.4rem 0.6rem',
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '20px', height: '14px', background: 'rgba(34, 197, 94, 0.3)', borderRadius: '3px' }} />
              <span>Low (0-30%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '20px', height: '14px', background: 'rgba(245, 158, 11, 0.3)', borderRadius: '3px' }} />
              <span>Medium (31-70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '20px', height: '14px', background: 'rgba(239, 68, 68, 0.3)', borderRadius: '3px' }} />
              <span>High (71-100%+)</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className="btn-icon" 
              onClick={() => changePeriod(-6)} 
              title="Previous 6 Months"
              style={{ width: '36px', height: '36px' }}
            >
              <span>←</span>
            </button>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-primary)', 
              minWidth: '140px', 
              textAlign: 'center',
              fontWeight: 500
            }}>
              {getDisplayRange()}
            </div>
            <button 
              className="btn-icon" 
              onClick={() => changePeriod(6)} 
              title="Next 6 Months"
              style={{ width: '36px', height: '36px' }}
            >
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="timeline-scroll-area">
        <TimelineGrid
          startIndex={startIndex}
          endIndex={endIndex}
          onAddAssignment={onAddAssignment}
          onEditAssignment={onEditAssignment}
        />
      </div>

      {/* Pagination */}
      <div className="timeline-footer">
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {paginationInfo}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn"
            onClick={() => changePage(-1)}
            disabled={currentPage <= 1 || showAll}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            ← Previous
          </button>
          <select 
            value={pageSize}
            onChange={changePageSize}
            style={{
              padding: '0.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          >
            <option value="5">5 per page</option>
            <option value="8">8 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="all">Show All</option>
          </select>
          <button 
            className="btn"
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages || showAll}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
