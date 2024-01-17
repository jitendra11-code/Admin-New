import axios from "axios";
import { useEffect, useState } from "react";

const style = {
  border: "1px solid black",
  padding: "10px 20px",
  borderRight : "0px !important",
};

const MyGridComponent = () => {
  const [data1, setData1] = useState<any>({});

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetGlCategoryCount?PhaseId=827`
      )
      .then((res) => {
        const groupedData = res?.data?.reduce((groups, item) => {
          const groupKey = item.glCategory;
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(item);
          return groups;
        }, {});
        setData1(groupedData);
      })
      .catch((err) => {
      });
  }, []);

  return (
    <div>
      <table style={{ borderCollapse: "collapse", border: "1px solid black" }}>
        <tr >
          <th style={style}>GL Category</th>
          <th style={style}>Branch Type</th>
          <th style={style}>Branch total</th>
          <th style={style}>GL Category total</th>
        </tr>
        <tr></tr>
        {Object.keys(data1)?.map((v, i) => {
          return data1?.[v]?.map((k, index) => {
            return i < Object.keys(data1).length - 1 ? (
              <tr>
                <th style={style}>{v}</th>
                <th style={style}>{k?.branchType}</th>
                <th style={style}>{k?.branchTotal}</th>
                {index == 0 && (
                  <th style={style} rowSpan={data1[v]?.length}>
                    {data1[v]?.length}
                  </th>
                )}
              </tr>
            ) : (
              <tr>
                <th style={style}></th>
                <th style={style}>{k?.branchType}</th>
                <th style={style}></th>
                <th style={style}>{k?.glCategoryTotal}</th>
              </tr>
            );
          });
        })}

        <tr></tr>
      </table>
    </div>
  );
};

export default MyGridComponent;


