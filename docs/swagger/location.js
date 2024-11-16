/**
 * @swagger
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         nameEn:
 *           type: string
 *           example: "Saudi Arabia"
 *         nameAr:
 *           type: string
 *           example: "المملكة العربية السعودية"
 *
 *     Region:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         nameEn:
 *           type: string
 *           example: "Riyadh Region"
 *         nameAr:
 *           type: string
 *           example: "منطقة الرياض"
 *
 *     City:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         nameEn:
 *           type: string
 *           example: "Riyadh"
 *         nameAr:
 *           type: string
 *           example: "الرياض"
 *         telCode:
 *           type: string
 *           example: "011"
 *
 * /api/locations/countries:
 *   get:
 *     tags: [Locations]
 *     summary: Get all active countries
 *     description: Retrieve a list of all active countries
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Countries retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
 *       500:
 *         description: Internal server error
 *
 * /api/locations/regions:
 *   get:
 *     tags: [Locations]
 *     summary: Get regions by country ID
 *     description: Retrieve a list of active regions for a specific country
 *     parameters:
 *       - in: query
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the country
 *         example: "1"
 *     responses:
 *       200:
 *         description: Regions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Regions retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     regions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Region'
 *       400:
 *         description: Country ID is required
 *       500:
 *         description: Internal server error
 *
 * /api/locations/cities:
 *   get:
 *     tags: [Locations]
 *     summary: Get cities by region ID
 *     description: Retrieve a list of active cities for a specific region
 *     parameters:
 *       - in: query
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the region
 *         example: "1"
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cities retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/City'
 *       400:
 *         description: Region ID is required
 *       500:
 *         description: Internal server error
 */
