use rand;

fn main(){

    // We generate a random dataset of size 1000 (vectors of 4356 boolean values)

    let mut dataset = Vec::new();
    for _ in 0..100000 {
        let mut vector = Vec::new();
        for _ in 0..4356 {
            vector.push(rand::random::<bool>());
        }
        dataset.push(vector);
    }

    let firstelement = &dataset[0];

    // We measure the time it takes to execute the following code

    let start = std::time::Instant::now();

    let error : Vec<u16> = dataset.iter().map(|x| compare_fingerprints(x, &firstelement)).collect();

    let end = std::time::Instant::now();

    let duration = end.duration_since(start);

    println!("{:?}", duration);

}

fn compare_fingerprints(fingerprint1: &[bool], fingerprint2: &[bool]) -> u16 {
    let mut count = 0;
    for i in 0..fingerprint1.len() {
        if fingerprint1[i] ^ fingerprint2[i] {
            count += 1;
        }
    }
    count
}