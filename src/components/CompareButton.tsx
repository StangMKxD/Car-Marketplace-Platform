import { useCompare } from "@/contexts/CompareContext"
import { Cartype } from "@/types"

const CompareButton = ({ car }: { car: Cartype}) => {
    const { carA, carB, toggle } = useCompare()

    const isCompared = carA?.id === car.id || carB?.id === car.id

  return (
    <>
    <button
    onClick={() => toggle(car)}
    className={`px-3 py-1 rounded cursor-pointer ${isCompared ? "bg-red-500" : "bg-green-500"}`}
    >
        {isCompared ? "ยกเลิก" : "เปรียบเทียบ"}
    </button>
    </>
  )
}
export default CompareButton