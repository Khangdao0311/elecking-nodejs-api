## Getting Started

npm i để kéo toàn bộ thư viện về máy

```bash
npm i
```

## CÁC API CỦA DỰ ÁN

### 1 Category

#### get by id

[http://localhost:3000/category/{categoryId}](http://localhost:3000/category/{categoryId})

**Trả về**
{stauts:200,message:"Success", data:[
    id: string,
    name: string,
    image: string,
    status: number, (1: hoạt động, 2: ẩn, 0: dừng hoạt động)
    properties: [
        string
    ],
    description: string
]}

#### get bt query

[http://localhost:3000/category](http://localhost:3000/category)

query có **id**, **search**, **orderby** default là sắp xếp theo id giảm dần , **page** default bằng 1 nếu không truyền, **limit** default bằng 5 nếu không truyền

**Trả về**
{stauts:200,message:"Success", data:[
    id: string,
    name: string,
    image: string,
    status: number, (1: hoạt động, 2: ẩn, 0: dừng hoạt động)
    properties: [
        string
    ],
    description: string
]}

**Ví dụ**
id={categoryId1}-{categoryId2}-...
search={keyword}
orderby={tên cột}-{desc hoặc asc}  nếu không truyền mặt định là desc
