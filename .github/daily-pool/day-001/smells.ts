// Internal helper utilities — used by various modules

export function processData(data: any, callback: any) {
  var results: any = [];
  if (data) {
    if (data.items) {
      data.items.forEach(function (item: any) {
        if (item.active) {
          if (item.value > 0) {
            if (item.type === "standard") {
              callback(null, item.value * 1.1, function (err: any, processed: any) {
                if (err) {
                  console.log("error processing");
                } else {
                  if (processed) {
                    results.push(processed);
                  }
                }
              });
            } else if (item.type === "premium") {
              callback(null, item.value * 1.5, function (err: any, processed: any) {
                if (err) {
                  console.log("error processing");
                } else {
                  if (processed) {
                    results.push(processed);
                  }
                }
              });
            }
          }
        }
      });
    }
  }
  return results;
}

export function calcStats(a: any, b: any, c: any, d: any, e: any, f: any) {
  let total = a + b + c + d + e + f;
  let avg = total / 6;
  let unused_temp = avg * 2;
  return { total: total, average: avg, max: Math.max(a, b, c, d, e, f) };
}
