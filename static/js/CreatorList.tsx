import { Link } from "react-router-dom";
import { getMarkColor } from "../../utils/Function";
const CreatorList = (props: any) => {
  const { creatorId, list, title, setting } = props;
  // console.log(list);

  return (
    <div>
      {Array.isArray(list) &&
        list.length > 0 &&
        list
          ?.reduce((rows: any[][], d, i) => {
            if (i % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(d);
            return rows;
          }, [])
          .map((row, rowIndex) => (
            <div key={rowIndex} className="grid-cols-2 grid gap-2 px-2">
              {row.map((item, index) => (
                <div key={index} className="bg-white relative my-2 mx-1 dark:bg-nbk">
                  <Link to={`/library/list/detail?creatorId=${item.author_id || creatorId}&id=${item.id}`}>
                    <img
                      src={setting?.img_host + item.work_image}
                      alt={item.id}
                      loading="lazy"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "1";
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/cover_default.jpg";
                      }}
                      width="100%"
                      height="auto"
                      className="object-cover h-56 bg-gy"
                      style={{
                        opacity: "0",
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    />
                    <div
                      className="absolute right-2 top-2 rounded-lg text-white p-[0.2rem]"
                      style={{ ...getMarkColor(item.platform_name) }}
                    >
                      {item.platform_name}
                    </div>
                  </Link>
                  {title ? (
                    <div className="px-2 text-gy dark:text-tgy">
                      <p className="truncate py-3">{item.work_title}</p>
                      <p className="truncate text-gy py-1 float-right">{item.work_date}</p>
                    </div>
                  ) : (
                    <div className="px-2">
                      <p className="truncate py-3 font-bold">{item.work_title}</p>
                      <Link to={`/library/list?lib=${item.author_id}`}>
                        <p className="truncate text-og py-2 underline">{item.author_name}</p>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
    </div>
  );
};
export default CreatorList;
