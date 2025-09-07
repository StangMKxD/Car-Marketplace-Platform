// import { useCompare } from "@/contexts/CompareContext"
// import { Cartype } from "@/types"

// const CompareButton = ({ car }: { car: Cartype}) => {
//     const { carA, carB, toggle } = useCompare()

//     const isCompared = carA?.id === car.id || carB?.id === car.id

//   return (
//     <>
//     <button
//     onClick={() => toggle(car)}
//     className={`px-3 py-1 rounded cursor-pointer ${isCompared ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
//     >
//         {isCompared ? "ยกเลิก" : "เปรียบเทียบ"}
//     </button>
//     </>
//   )
// }
// export default CompareButton

import { useCompare } from "@/contexts/CompareContext";
import { Cartype } from "@/types";
import { useState, useEffect } from "react";

type CompareButtonProps = {
  car: Cartype;
};

const CompareButton = ({ car }: CompareButtonProps) => {
  const { carA, carB, toggle } = useCompare();
  const isCompared = carA?.id === car.id || carB?.id === car.id;

  const [delta, setDelta] = useState(0); // +1 หรือ -1

  const handleClick = () => {
    if (!isCompared) {
      setDelta(1); 
    } else {
      setDelta(-1); 
    }

    setTimeout(() => setDelta(0), 800);
    toggle(car);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`px-3 py-2 rounded cursor-pointer ${
          isCompared ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isCompared ? "ยกเลิก" : "เปรียบเทียบ"}
      </button>

      {delta !== 0 && (
        <span
          className={`absolute -top-4 right-0 font-bold ${
            delta > 0 ? "text-green-500" : "text-red-500"
          } animate-fadeUp`}
        >
          {delta > 0 ? "+1" : "-1"}
        </span>
      )}
    </div>
  );
};

export default CompareButton;



