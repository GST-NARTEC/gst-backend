import Joi from "joi";
import createError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
const mega_menus = Joi.object({
  name_en: Joi.string().max(255).required(),
  name_ar: Joi.string().max(255).required(),
  status: Joi.number().required(),
});

export const getAllmega_menu = async (req, res, next) => {
  try {
    const AllUNSPSC = await prisma.mega_menus.findMany({
      orderBy: {
        updated_at: "desc", // Order by updated_at in descending order
      },
    });

    res.json(AllUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const createmega_menus = async (req, res, next) => {
  try {
    const { error, value } = mega_menus.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const unit = await prisma.mega_menus.create({
      data: value,
    });
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};

export const getmega_menusById = async (req, res, next) => {
  try {
    // const { id } = req.params;
    // use JOi to validate the id
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { id } = req.params;

    const cr = await prisma.mega_menus.findUnique({
      where: { id: id },
    });
    if (!cr) {
      return next(createError(404, "mega_menus not found"));
    }
    return res.json(cr);
  } catch (error) {
    next(error);
  }
};

export const updatemega_menus = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error: idError } = schema.validate(req.params);
    if (idError) {
      return next(createError(400, idError.details[0].message));
    }

    const { id } = req.params;

    const { error } = mega_menus.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name_en, name_ar, status } = req.body;
    const updatedUNSPSC = await prisma.mega_menus.update({
      where: { id: id },
      data: {
        name_en,
        name_ar,
        status,
      },
    });

    res.json(updatedUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const deletemega_menus = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(createError(400, error.details[0].message));
    }
    const { id } = req.params;
    await prisma.mega_menus.delete({
      where: { id: id },
    });
    return res.json({ message: "mega menus deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const mega_menu_categories = Joi.object({
  parent_id: Joi.string().max(255).required(),
  megamenu_id: Joi.string().max(255).required(),
  category_name_en: Joi.string().max(255).required(),
  category_name_ar: Joi.string().max(255).required(),
  description: Joi.string().max(255),
  url: Joi.string().max(255),
  caption: Joi.string().max(255),
  caption_ar: Joi.string().max(255),
  meta_title: Joi.string().max(255),
  meta_description: Joi.string().max(255),
  meta_keywords: Joi.string().max(255),
  status: Joi.number().required(),
});

export const getAllmega_menu_categories = async (req, res, next) => {
  try {
    const AllUNSPSC = await prisma.mega_menu_categories.findMany({
      orderBy: {
        updated_at: "desc", // Order by updated_at in descending order
      },
    });

    res.json(AllUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const creatmega_menu_categories = async (req, res, next) => {
  let imagePath;
  try {
    const { error, value } = mega_menu_categories.validate(req.body);
    if (error) {
      throw new MyError(error.details[0].message, 400);
    }

    if (req.file) {
      imagePath = addDomain(req.file.path);
      value.image = imagePath;
    }

    const newCategory = await prisma.mega_menu_categories.create({
      data: value,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    if (imagePath) {
      await deleteFile(imagePath);
    }
    next(error);
  }
};

export const getmega_menu_categoriesById = async (req, res, next) => {
  try {
    // const { id } = req.params;
    // use JOi to validate the id
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { id } = req.params;

    const cr = await prisma.mega_menu_categories.findUnique({
      where: { id: id },
    });
    if (!cr) {
      return next(createError(404, "mega menu categories not found"));
    }
    return res.json(cr);
  } catch (error) {
    next(error);
  }
};

export const updatemega_menu_categories = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = mega_menu_categories.validate(req.body);

    if (error) {
      throw new MyError(error.details[0].message, 400);
    }

    const existingCategory = await prisma.mega_menu_categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new MyError("Mega menu category not found", 404);
    }

    if (req.file) {
      imagePath = addDomain(req.file.path);
      if (existingCategory.image) {
        await deleteFile(existingCategory.image);
      }
      value.image = imagePath;
    }

    const updatedCategory = await prisma.mega_menu_categories.update({
      where: { id },
      data: value,
    });

    res.json(updatedCategory);
  } catch (error) {
    if (imagePath) {
      await deleteFile(imagePath);
    }
    next(error);
  }
};

export const deletemega_menu_categories = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.mega_menu_categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new MyError("Mega menu category not found", 404);
    }

    if (category.image) {
      await deleteFile(category.image);
    }

    await prisma.mega_menu_categories.delete({
      where: { id },
    });

    res.json({ message: "Mega menu category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const mega_menu_categories_frontSide = async (req, res, next) => {
  try {
    const mega_menus_with_categories = await prisma.mega_menus.findMany({
      where: {
        status: 1,
      },
      include: {
        mega_menu_categories: {
          where: {
            status: 1,
          },
          include: {
            footer_menus: {
              where: {
                status: 1,
              },
            },
          },
        },
      },
    });

    res.json(mega_menus_with_categories);
  } catch (error) {
    console.error("Error fetching mega menu categories:", error);
    next(error);
  }
};

const footer_menus = Joi.object({
  parent_id: Joi.string().max(255).required(),
  category_name_en: Joi.string().max(255).required(),
  category_name_ar: Joi.string().max(255).required(),
  url: Joi.string().max(255).required(),
  status: Joi.number().required(),
});

export const getAllfooter_menus = async (req, res, next) => {
  try {
    const AllUNSPSC = await prisma.footer_menus.findMany({
      orderBy: {
        updated_at: "desc", // Order by updated_at in descending order
      },
    });

    res.json(AllUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const creatfooter_menus = async (req, res, next) => {
  try {
    const { error, value } = footer_menus.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const unit = await prisma.footer_menus.create({
      data: value,
    });
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};

export const getfooter_menusById = async (req, res, next) => {
  try {
    // const { id } = req.params;
    // use JOi to validate the id
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { id } = req.params;

    const cr = await prisma.footer_menus.findUnique({
      where: { id: id },
    });
    if (!cr) {
      return next(createError(404, "footer menus not found"));
    }
    return res.json(cr);
  } catch (error) {
    next(error);
  }
};

export const updatefooter_menus = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error: idError } = schema.validate(req.params);
    if (idError) {
      return next(createError(400, idError.details[0].message));
    }

    const { id } = req.params;

    const { error } = footer_menus.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { parent_id, category_name_en, category_name_ar, url, status } =
      req.body;
    const updatedUNSPSC = await prisma.footer_menus.update({
      where: { id: id },
      data: {
        parent_id,
        category_name_en,
        category_name_ar,
        url,
        status,
      },
    });

    res.json(updatedUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const deletefooter_menus = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(createError(400, error.details[0].message));
    }
    const { id } = req.params;
    await prisma.footer_menus.delete({
      where: { id: id },
    });
    return res.json({ message: "footer menus deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const languageSchema = Joi.object({
  type: Joi.string(), // No maximum length constraint
  key: Joi.string().required(), // No maximum length constraint, but required
  value: Joi.string().required(), // No maximum length constraint, but required
});

export const translations = async (req, res, next) => {
  try {
    const AllUNSPSC = await prisma.languages.findMany();

    // Create an empty object to store the formatted data
    let formattedData = {};

    // Loop through the data and populate the formatted object
    AllUNSPSC.forEach((item) => {
      formattedData[item.key] = item.value;
    });

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

export const translations_table = async (req, res, next) => {
  try {
    const AllUNSPSC = await prisma.languages.findMany();

    res.json(AllUNSPSC);
  } catch (error) {
    next(error);
  }
};

export const translations_put = async (req, res, next) => {
  try {
    const languageSchema = Joi.object({
      value: Joi.string().required(),
    });

    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error: idError } = schema.validate(req.params);
    if (idError) {
      throw createError(400, idError.details[0].message);
    }

    const { id } = req.params;

    const { error: validationError } = languageSchema.validate(req.body);
    if (validationError) {
      throw createError(400, validationError.details[0].message);
    }

    const { value } = req.body;
    const updatedTranslation = await prisma.languages.update({
      where: {
        id: id, // Assuming "key" is the correct field to identify the record
      },
      data: {
        value: value,
      },
    });

    res.json(updatedTranslation);
  } catch (error) {
    next(error);
  }
};

export const translations_post = async (req, res, next) => {
  try {
    const { error, value } = languageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const unit = await prisma.languages.create({
      data: value,
    });
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};
