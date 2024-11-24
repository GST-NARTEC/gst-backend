/**
 * @swagger
 * components:
 *   schemas:
 *     WhyBarcode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         titleEn:
 *           type: string
 *           description: Title in English
 *         titleAr:
 *           type: string
 *           description: Title in Arabic
 *         descriptionEn:
 *           type: string
 *           description: Description in English
 *         descriptionAr:
 *           type: string
 *           description: Description in Arabic
 *         image:
 *           type: string
 *           description: Image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /v1/api/whybarcode:
 *   post:
 *     tags: [Why Barcode]
 *     summary: Create a new why barcode entry
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionAr:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Why Barcode created successfully
 *
 *   get:
 *     tags: [Why Barcode]
 *     summary: Get all why barcode entries
 *     responses:
 *       200:
 *         description: List of why barcode entries retrieved successfully
 *
 * /v1/api/whybarcode/{id}:
 *   get:
 *     tags: [Why Barcode]
 *     summary: Get a specific why barcode entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Why Barcode retrieved successfully
 *       404:
 *         description: Why Barcode not found
 *
 *   put:
 *     tags: [Why Barcode]
 *     summary: Update a why barcode entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionAr:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Why Barcode updated successfully
 *       404:
 *         description: Why Barcode not found
 *
 *   delete:
 *     tags: [Why Barcode]
 *     summary: Delete a why barcode entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Why Barcode deleted successfully
 */
