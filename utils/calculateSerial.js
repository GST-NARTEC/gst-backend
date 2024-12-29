const calculateSerialNo = async (gtin, batch, id) => {
  // last 10 digits of gtin
  const gtinLast10 = gtin.slice(-10);

  // concate gtinLast10 with batch and id along with dashes
  const serialNo = `${gtinLast10}-${batch}-${id}`;

  return serialNo;
};

export default calculateSerialNo;
