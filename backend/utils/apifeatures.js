class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // ^  ---------------------->  creating API'S Search FEATURE ---------------------------->

  //? MongoDB offers a full-text search solution,
  //   regex stands for regular expression
  //? $regex: Provides regular expression capabilities for pattern matching strings in queries.
  // MongoDB Atlas Search If you frequently run case-insensitive regex queries (utilizing the i option), MongoDB recommends Atlas Search queries that use the  $search aggregation pipeline stage.

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i", //& case insensitive search
          },
        }
      : {};

    
    this.query = this.query.find({ ...keyword });
    return this;
  }

  //^ -----------------> Filter API Feature -------------------------------------->

  filter() {
    //& -------->  CREATING FILTER FOR  <CATEGORY> -------->

    const queryCopy = { ...this.queryStr };
    // console.log(queryCopy); //~clg before removing fields
    //Removing some fields for category

    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // console.log(queryCopy); //~clg after removing fields

    //&--------------> CREATING FILTER FOR <PRICE> --------->

    let queryStr = JSON.stringify(queryCopy); // to convert queryCopy object into string

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`); //

    this.query = this.query.find(JSON.parse(queryStr)); // wapas se object

    return this;
  }
  //^ -----------------> PAGINATION API Feature -------------------------------------->

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
