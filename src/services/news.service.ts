import { ModelNews } from "@/models/news.model";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import slugify from "slugify";

class NewsService {
  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelNews.query().select()
    .from(ModelNews.tableName)
    .withGraphFetched('[user]')
    .whereNotDeleted();
    if(param.category){
      data = data.where('category',param.category)
    }
    if(param.is_highlight){
      data = data.where('is_highlight',true)
    }
    if(param.search){
      data = data.where('title','ILIKE',"%" + param.search + "%")
    }
    if(param.sortBy){
      data = data.orderBy(param.sortBy,param.sortType)
    }else{
      data = data.orderBy('id','desc')
    }
   
    data = await data.page(page,param.perPage);

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelNews.query().select()
    .from(ModelNews.tableName)
    .whereNotDeleted()
    .where('id',id).orWhere('slug',id).first();

    return data;
  }

  public async create(param: any): Promise<any> {
    //check slug
    let slug:any = slugify(param.title.toLowerCase())
    const checkSlug:any = await ModelNews.query().select().from(ModelNews.tableName).where("slug", "=", slug);
    if (checkSlug.length > 0) {
      slug = slug+'-'+(parseInt(checkSlug.length)+1)
    }
    param.slug = slug

    const insert:any = await ModelNews.query().insert({
      id:generateId(),
      category:param.category,
      title:param.title,
      description:param.description,
      content:param.content,
      banner:param.banner,
      user_id:param.user_id,
      slug:param.slug
    }).into(ModelNews.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return insert;
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelNews.query().select().from(ModelNews.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check slug
    //check slug
    if(param.title){
      let slug:any = slugify(param.title.toLowerCase())
      const checkSlug:any = await ModelNews.query().select().from(ModelNews.tableName).where("slug", "=", slug).where('id','!=',id);
      if (checkSlug.length > 0) {
        slug = slug+'-'+(parseInt(checkSlug.length)+1)
      }
      param.slug = slug
    }
   
    await ModelNews.query().update(param).where("id", "=", id).into(ModelNews.tableName);

    const updateData: any = await ModelNews.query().select().from(ModelNews.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelNews.query().select().from(ModelNews.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelNews.query().delete().where("id", "=", id).into(ModelNews.tableName);
    return data;
  }
}

export default NewsService;
