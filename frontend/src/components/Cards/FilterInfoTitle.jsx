import moment from "moment";
import { IoMdClose } from "react-icons/io";
import { MdOutlineClose } from "react-icons/md";

const FilterInfoTitle = ({ filterType, filterDates, onClear }) => {
  const DateRangeChip = ({ date }) => {
    const startDate = date?.from
      ? moment(date?.from).format("Do MMM YYYY")
      : "N/A";
    const endDate = date?.to ? moment(date?.to).format("Do MMM YYYY") : "N/A";

    return (
      <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-full transition-all hover:bg-cyan-100">
        <p className="text-sm text-cyan-700 font-medium">
          {startDate} - {endDate}
        </p>
        <button
          onClick={onClear}
          className="p-1 hover:bg-cyan-200 rounded-full transition-all"
        >
          <IoMdClose className="w-4 h-4 text-cyan-600" />
        </button>
      </div>
    );
  };

  if (!filterType) return null;

  return (
    <div className="mb-6">
      {filterType === "search" ? (
        <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-slate-800">
            Memories from
          </h3>
          <DateRangeChip date={filterDates} />
        </div>
      )}
    </div>
  );
};

export default FilterInfoTitle;
