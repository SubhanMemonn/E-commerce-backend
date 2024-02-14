import { Product } from "../models/product.model.js";

const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth == 0) return thisMonth * 100;

    let percentage = (thisMonth / lastMonth) * 100;

    return Number(percentage.toFixed(0));
}
const getInventories = async ({
    categories,
    productsCount,
}) => {
    const categoriesCountPromise = await categories.map((category) => Product.countDocuments({ category }));

    const categoriesCount = await Promise.all(categoriesCountPromise);

    let categoryCount = []

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100)
        })
    });

    return categoryCount
}

const getChartData = ({
    length,
    docArr,
    today,
    property,
}) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        let creationDate = i.createdAt;
        let monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12
        if (monthDiff < length) {

            if (property) {
                data[length - monthDiff - 1] += i[property];
            } else {
                data[length - monthDiff - 1] += 1;

            }
        }
    })
    return data
}
export {
    calculatePercentage,
    getInventories,
    getChartData
}