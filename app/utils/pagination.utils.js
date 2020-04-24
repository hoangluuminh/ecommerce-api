/*
  currentPage: Selected page number
  pageSize: Number of items to be shown on a page
  itemCount: Total item count
  visibleCount: Number of page numbers to be shown
  =>
  pageCount: Total number of pages based on pageSize, itemCount
  visiblePages: Indexes of visible pages based on visibleCount, currentPage
*/
exports.paginationInfo = (currentPage, pageSize, itemCount, _visibleCount) => {
  // pageCount
  const pageCount = Math.ceil(itemCount / pageSize);
  if (currentPage > pageCount) {
    return {
      currentPage,
      pageSize,
      itemCount,
      visibleCount: 0,
      pageCount: 0,
      visiblePages: []
    };
  }
  // visiblePages
  const visiblePages = [];
  const visibleCount = _visibleCount % 2 === 0 ? _visibleCount + 1 : _visibleCount;
  const pivot = Math.floor(visibleCount / 2);
  for (let i = currentPage - pivot; i <= currentPage + pivot; i += 1) {
    if (i > 0 && i <= pageCount) {
      visiblePages.push(i);
    }
  }
  if (!(visiblePages[0] === 1 && visiblePages[visiblePages.length - 1] === pageCount)) {
    while (visiblePages.length < visibleCount && visiblePages.length < pageCount) {
      const lastItemIndex = visiblePages[visiblePages.length - 1];
      if (lastItemIndex !== pageCount) {
        // Add remaining to back
        visiblePages.push(lastItemIndex + 1);
      } else {
        // Add remaining to front
        visiblePages.unshift(visiblePages[0] - 1);
      }
    }
  }
  // returns
  return {
    currentPage,
    pageSize,
    itemCount,
    visibleCount,
    pageCount,
    visiblePages
  };
};
